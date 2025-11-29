import { BomPrecisDataHandler, AmocMetadata, ForecastArea } from './bom-precis-handler';
import { BOM_STATE_FEEDS } from './bom-config';

export async function ingestBomData(db: any) {
    const results = [];
    let logId = null;

    try {
        // Start logging
        const result = await db.prepare(`
            INSERT INTO bom_ingestion_logs (started_at, status, details)
            VALUES (?, ?, ?)
            RETURNING id
        `).bind(Date.now(), 'running', 'Started Precis ingestion').first();

        if (result) {
            logId = result.id;
        }
    } catch (e) {
        console.error('Failed to create ingestion log:', e);
    }

    try {
        for (const feed of BOM_STATE_FEEDS) {
            console.log(`Fetching ${feed.name} (${feed.productId}) from ${feed.url}...`);
            try {
                const response = await fetch(feed.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (!response.ok) {
                    console.error(`Failed to fetch ${feed.name}: ${response.status} ${response.statusText}`);
                    results.push({
                        name: feed.name,
                        productId: feed.productId,
                        status: 'failed',
                        error: response.statusText
                    });
                    continue;
                }

                const xmlData = await response.text();

                // Parse using BomPrecisDataHandler
                const handler = new BomPrecisDataHandler(xmlData);
                handler.parse();

                // Extract metadata
                const metadata = handler.extractAmocMetadata();
                await storeMetadata(db, metadata, feed, Date.now());

                // Extract and store hierarchical areas
                const { regions, districts, locations } = handler.extractAreasByLevel();

                // Store in hierarchy order: regions first, then districts, then locations
                for (const region of regions) {
                    await storeArea(db, region, 'region');
                }

                for (const district of districts) {
                    await storeArea(db, district, 'district');
                }

                for (const location of locations) {
                    await storeArea(db, location, 'location');

                    // Store forecast periods for this location
                    const periods = handler.extractForecastPeriods(location);
                    for (const period of periods) {
                        await storeForecastPeriod(db, location['@_aac'], period, handler);
                    }
                }

                results.push({
                    name: feed.name,
                    productId: feed.productId,
                    status: 'success',
                    counts: {
                        regions: regions.length,
                        districts: districts.length,
                        locations: locations.length,
                        forecasts: locations.reduce((sum, loc) =>
                            sum + handler.extractForecastPeriods(loc).length, 0
                        )
                    }
                });

            } catch (error: any) {
                console.error(`Error processing ${feed.name}:`, error);
                results.push({
                    name: feed.name,
                    productId: feed.productId,
                    status: 'failed',
                    error: error.message
                });
            }
        }
    } catch (error: any) {
        console.error('Fatal ingestion error:', error);

        if (logId) {
            await db.prepare(`
                UPDATE bom_ingestion_logs 
                SET completed_at = ?, status = ?, details = ?
                WHERE id = ?
            `).bind(Date.now(), 'failed', JSON.stringify({ error: error.message }), logId).run();
        }
        throw error;
    }

    // Update log on completion
    if (logId) {
        const hasFailures = results.some(r => r.status === 'failed');
        const status = hasFailures ? 'partial_success' : 'success';

        await db.prepare(`
            UPDATE bom_ingestion_logs 
            SET completed_at = ?, status = ?, details = ?
            WHERE id = ?
        `).bind(Date.now(), status, JSON.stringify(results), logId).run();
    }

    return results;
}

/**
 * Store AMOC metadata in database
 */
async function storeMetadata(
    db: any,
    metadata: AmocMetadata,
    feed: typeof BOM_STATE_FEEDS[0],
    fetchedAt: number
) {
    await db.prepare(`
        INSERT INTO bom_metadata (
            product_id, state, region, office, sender, copyright, disclaimer,
            issue_time_utc, issue_time_local, issue_time_local_tz,
            sent_time, expiry_time,
            validity_bgn_time_local, validity_bgn_time_local_tz,
            validity_end_time_local, validity_end_time_local_tz,
            next_routine_issue_time_utc, next_routine_issue_time_local, next_routine_issue_time_local_tz,
            status, service, sub_service, product_type, phase, fetched_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id, issue_time_utc) DO UPDATE SET
            fetched_at = excluded.fetched_at
    `).bind(
        metadata.identifier,
        feed.name,
        metadata.source.region,
        metadata.source.office,
        metadata.source.sender,
        metadata.source.copyright,
        metadata.source.disclaimer,
        metadata['issue-time-utc'],
        metadata['issue-time-local']['#text'],
        metadata['issue-time-local']['@_tz'],
        metadata['sent-time'],
        metadata['expiry-time'],
        metadata['validity-bgn-time-local']['#text'],
        metadata['validity-bgn-time-local']['@_tz'],
        metadata['validity-end-time-local']['#text'],
        metadata['validity-end-time-local']['@_tz'],
        metadata['next-routine-issue-time-utc'],
        metadata['next-routine-issue-time-local']['#text'],
        metadata['next-routine-issue-time-local']['@_tz'],
        metadata.status,
        metadata.service,
        metadata['sub-service'],
        metadata['product-type'],
        metadata.phase,
        fetchedAt
    ).run();
}

/**
 * Store area (region, district, or location) in database
 */
async function storeArea(db: any, area: ForecastArea, level: string) {
    await db.prepare(`
        INSERT INTO bom_locations (aac, parent_aac, description, type, level, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(aac) DO UPDATE SET
            parent_aac = excluded.parent_aac,
            description = excluded.description,
            type = excluded.type,
            level = excluded.level,
            updated_at = excluded.updated_at
    `).bind(
        area['@_aac'],
        area['@_parent-aac'] || null,
        area['@_description'],
        area['@_type'],
        level,
        Date.now()
    ).run();
}

/**
 * Store forecast period for a location
 */
async function storeForecastPeriod(
    db: any,
    aac: string,
    period: any,
    handler: BomPrecisDataHandler
) {
    // Extract specific values for backward compatibility
    const minTemp = handler.getElementValue(period, 'air_temperature_minimum');
    const maxTemp = handler.getElementValue(period, 'air_temperature_maximum');
    const iconCode = handler.getElementValue(period, 'forecast_icon_code');
    const precipRange = handler.getElementValue(period, 'precipitation_range');
    const precis = handler.getTextValue(period, 'precis');
    const probPrecip = handler.getTextValue(period, 'probability_of_precipitation');

    // Extract all elements and texts as JSON
    const elementsJSON = handler.elementsToJSON(period);
    const textsJSON = handler.textsToJSON(period);

    await db.prepare(`
        INSERT INTO bom_forecasts (
            aac, period_index,
            start_time_local, end_time_local,
            start_time_utc, end_time_utc,
            min_temp, max_temp, icon_code, precip_range, precis, prob_precip,
            elements, texts, fetched_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(aac, start_time_local) DO UPDATE SET
            period_index = excluded.period_index,
            end_time_local = excluded.end_time_local,
            start_time_utc = excluded.start_time_utc,
            end_time_utc = excluded.end_time_utc,
            min_temp = excluded.min_temp,
            max_temp = excluded.max_temp,
            icon_code = excluded.icon_code,
            precip_range = excluded.precip_range,
            precis = excluded.precis,
            prob_precip = excluded.prob_precip,
            elements = excluded.elements,
            texts = excluded.texts,
            fetched_at = excluded.fetched_at
    `).bind(
        aac,
        period['@_index'] ?? null,
        period['@_start-time-local'],
        period['@_end-time-local'],
        period['@_start-time-utc'] ?? null,
        period['@_end-time-utc'] ?? null,
        minTemp || null,
        maxTemp || null,
        iconCode || null,
        precipRange || null,
        precis || null,
        probPrecip || null,
        elementsJSON,
        textsJSON,
        Date.now()
    ).run();
}
