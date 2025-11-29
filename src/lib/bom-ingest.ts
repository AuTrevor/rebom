import { XMLParser } from 'fast-xml-parser';
import { BOM_CITY_FEEDS } from './bom-config';

interface BomArea {
    '@_aac': string;
    '@_description': string;
    '@_type': string;
    '@_parent-aac': string;
    'forecast-period': BomForecastPeriod[] | BomForecastPeriod;
}

interface BomForecastPeriod {
    '@_index': string;
    '@_start-time-local': string;
    '@_end-time-local': string;
    element: BomElement[] | BomElement;
    text: BomText[] | BomText;
}

interface BomElement {
    '@_type': string;
    '#text': string | number;
}

interface BomText {
    '@_type': string;
    '#text': string;
}

export async function ingestBomData(db: any) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });

    const results = [];

    for (const feed of BOM_CITY_FEEDS) {
        console.log(`Fetching ${feed.name} from ${feed.url}...`);
        try {
            const response = await fetch(feed.url, {
                headers: {
                    // BOM requires a browser-like User-Agent
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch ${feed.name}: ${response.status} ${response.statusText}`);
                results.push({ name: feed.name, status: 'failed', error: response.statusText });
                continue;
            }

            const xmlData = await response.text();
            const jsonObj = parser.parse(xmlData);

            // Navigate to forecast areas
            // Structure: product -> forecast -> area[]
            const areas = jsonObj.product?.forecast?.area;

            if (!areas) {
                console.error(`Invalid XML structure for ${feed.name}`);
                results.push({ name: feed.name, status: 'failed', error: 'Invalid XML' });
                continue;
            }

            const areaList: BomArea[] = Array.isArray(areas) ? areas : [areas];

            for (const area of areaList) {

                // Upsert Location
                await db.prepare(`
                    INSERT INTO bom_locations (aac, parent_aac, description, type, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(aac) DO UPDATE SET
                        parent_aac=excluded.parent_aac,
                        description=excluded.description,
                        type=excluded.type,
                        updated_at=excluded.updated_at
                `).bind(
                    area['@_aac'],
                    area['@_parent-aac'] || null,
                    area['@_description'],
                    area['@_type'],
                    Date.now()
                ).run();

                // Process Forecast Periods
                const periods = area['forecast-period'];
                if (!periods) continue;
                const periodList: BomForecastPeriod[] = Array.isArray(periods) ? periods : [periods];

                for (const period of periodList) {
                    const startTime = period['@_start-time-local'];
                    const endTime = period['@_end-time-local'];

                    // Extract elements
                    const elements = period.element ? (Array.isArray(period.element) ? period.element : [period.element]) : [];
                    const texts = period.text ? (Array.isArray(period.text) ? period.text : [period.text]) : [];

                    let minTemp = null;
                    let maxTemp = null;
                    let iconCode = null;
                    let precipRange = null;
                    let precis = null;
                    let probPrecip = null;

                    for (const el of elements) {
                        if (el['@_type'] === 'air_temperature_minimum') minTemp = el['#text'];
                        if (el['@_type'] === 'air_temperature_maximum') maxTemp = el['#text'];
                        if (el['@_type'] === 'forecast_icon_code') iconCode = el['#text'];
                        if (el['@_type'] === 'precipitation_range') precipRange = el['#text'];
                    }

                    for (const txt of texts) {
                        if (txt['@_type'] === 'precis') precis = txt['#text'];
                        if (txt['@_type'] === 'probability_of_precipitation') probPrecip = txt['#text'];
                    }

                    // Insert Forecast
                    // We use INSERT OR REPLACE or ON CONFLICT UPDATE
                    await db.prepare(`
                        INSERT INTO bom_forecasts (aac, start_time_local, end_time_local, min_temp, max_temp, icon_code, precip_range, precis, prob_precip, fetched_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(aac, start_time_local) DO UPDATE SET
                            end_time_local=excluded.end_time_local,
                            min_temp=excluded.min_temp,
                            max_temp=excluded.max_temp,
                            icon_code=excluded.icon_code,
                            precip_range=excluded.precip_range,
                            precis=excluded.precis,
                            prob_precip=excluded.prob_precip,
                            fetched_at=excluded.fetched_at
                    `).bind(
                        area['@_aac'],
                        startTime,
                        endTime,
                        minTemp || null,
                        maxTemp || null,
                        iconCode || null,
                        precipRange || null,
                        precis || null,
                        probPrecip || null,
                        Date.now()
                    ).run();
                }
            }
            results.push({ name: feed.name, status: 'success' });

        } catch (error: any) {
            console.error(`Error processing ${feed.name}:`, error);
            results.push({ name: feed.name, status: 'failed', error: error.message });
        }
    }
    return results;
}
