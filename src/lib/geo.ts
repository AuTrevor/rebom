/**
 * Geocode a location and cache the result
 */
export async function geocodeLocation(db: any, locationName: string, state?: string) {
    // Check cache first
    let query = 'SELECT * FROM geo_cache WHERE location_name = ?';
    const bindings = [locationName];

    if (state) {
        query += ' AND state = ?';
        bindings.push(state);
    }

    const cached = await db.prepare(query).bind(...bindings).first();
    if (cached) {
        return { lat: cached.lat, lon: cached.lon };
    }

    // Fetch from Nominatim
    let lat = 0;
    let lon = 0;

    try {
        // Use structured query for better results
        const params = new URLSearchParams({
            city: locationName,
            country: 'Australia',
            format: 'json',
            limit: '1'
        });

        if (state) {
            params.append('state', state);
        }

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            headers: {
                'User-Agent': 'ReBOM/1.0 (trevor@rebom.au)' // Identify our app
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                lat = parseFloat(data[0].lat);
                lon = parseFloat(data[0].lon);
            } else {
                console.warn(`No geocoding results found for ${locationName}, ${state}`);
            }
        } else {
            console.error(`Nominatim API failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error fetching from Nominatim:', error);
    }

    // Store in cache if we found a result (or even if we didn't, to avoid repeated failures? 
    // For now, let's only cache valid results to allow retries)
    if (lat !== 0 || lon !== 0) {
        await db.prepare(`
            INSERT INTO geo_cache (location_name, state, lat, lon, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(location_name, state) DO UPDATE SET
                lat = excluded.lat,
                lon = excluded.lon,
                created_at = excluded.created_at
        `).bind(locationName, state || null, lat, lon, Math.floor(Date.now() / 1000)).run();
    }

    return { lat, lon };
}
