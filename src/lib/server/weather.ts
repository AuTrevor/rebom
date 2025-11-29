import { geocodeLocation } from '../geo';

export interface RawWeatherData {
    location: any;
    metadata: any;
    forecasts: any[];
    warnings: any[];
}

export async function getCityWeatherRaw(db: any, cityName: string): Promise<RawWeatherData | null> {
    if (!db) {
        console.error('Database not bound');
        return null;
    }

    try {
        // Search for locations that match the city name
        // Using LIKE for fuzzy matching - matches "Sydney" in "Sydney - City", etc.
        const location = await db.prepare(
            `SELECT 
                l.*,
                p.description as parent_description,
                gp.description as grandparent_description
             FROM bom_locations l
             LEFT JOIN bom_locations p ON l.parent_aac = p.aac
             LEFT JOIN bom_locations gp ON p.parent_aac = gp.aac
             WHERE l.description LIKE ? 
             AND l.type IN ('metropolitan-area', 'metropolitan', 'location')
             ORDER BY 
                CASE 
                    WHEN l.description = ? THEN 0
                    WHEN l.description LIKE ? THEN 1
                    ELSE 2
                END,
                l.description ASC
             LIMIT 1`
        ).bind(`%${cityName}%`, cityName, `${cityName}%`).first();

        if (!location) {
            return null;
        }

        // Get forecasts for this location
        const forecasts = await db.prepare(
            `SELECT * FROM bom_forecasts 
             WHERE aac = ? 
             ORDER BY start_time_local ASC`
        ).bind(location.aac).all();

        // Determine product ID prefix from AAC to fetch metadata
        let productIdPrefix = '';
        if (location.aac.startsWith('NSW')) productIdPrefix = 'IDN';
        else if (location.aac.startsWith('VIC')) productIdPrefix = 'IDV';
        else if (location.aac.startsWith('QLD')) productIdPrefix = 'IDQ';
        else if (location.aac.startsWith('WA')) productIdPrefix = 'IDW';
        else if (location.aac.startsWith('TAS')) productIdPrefix = 'IDT';
        else if (location.aac.startsWith('NT')) productIdPrefix = 'IDD';
        else if (location.aac.startsWith('SA')) productIdPrefix = 'IDS';

        let metadata = null;
        if (productIdPrefix) {
            metadata = await db.prepare(
                `SELECT issue_time_local, issue_time_local_tz 
                 FROM bom_metadata 
                 WHERE product_id LIKE ? 
                 ORDER BY fetched_at DESC LIMIT 1`
            ).bind(`${productIdPrefix}%`).first();
        }

        // Construct hierarchy string
        let hierarchy = location.description;
        if (location.parent_description) {
            hierarchy = `${location.parent_description} > ${hierarchy}`;
        }
        if (location.grandparent_description) {
            hierarchy = `${location.grandparent_description} > ${hierarchy}`;
        }

        // Geocode the location
        const coords = await geocodeLocation(db, location.description);

        // Determine state from AAC or location data
        let state = location.state;
        if (!state) {
            if (location.aac.startsWith('NSW')) state = 'New South Wales';
            else if (location.aac.startsWith('VIC')) state = 'Victoria';
            else if (location.aac.startsWith('QLD')) state = 'Queensland';
            else if (location.aac.startsWith('WA')) state = 'Western Australia';
            else if (location.aac.startsWith('TAS')) state = 'Tasmania';
            else if (location.aac.startsWith('NT')) state = 'Northern Territory';
            else if (location.aac.startsWith('SA')) state = 'South Australia';
            else if (location.aac.startsWith('ACT')) state = 'New South Wales';
        }

        // Fetch warnings for the state
        const now = Math.floor(Date.now() / 1000);
        let warnings = [];
        if (state) {
            const warningsResult = await db.prepare(
                `SELECT * FROM bom_warnings 
                 WHERE state = ? AND expiry_time > ?
                 ORDER BY severity DESC, created_at DESC`
            ).bind(state, now).all();
            warnings = warningsResult.results || [];
        } else {
            // Fallback to location name if state not found (legacy behavior)
            const warningsResult = await db.prepare(
                `SELECT * FROM bom_warnings 
                 WHERE location_name = ? AND expiry_time > ?`
            ).bind(location.description, now).all();
            warnings = warningsResult.results || [];
        }

        return {
            location: {
                ...location,
                hierarchy,
                lat: coords.lat,
                lon: coords.lon
            },
            metadata: metadata || {},
            forecasts: forecasts.results || [],
            warnings: warnings || [] // warnings is already an array from .results check above, but being safe
        };

    } catch (error: any) {
        console.error('Error fetching city weather raw:', error);
        return null;
    }
}
