-- schema.sql

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY, -- user_id or unique device id
    unit_system TEXT DEFAULT 'metric', -- 'metric' or 'imperial'
    default_location_id INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

-- Saved Locations
CREATE TABLE IF NOT EXISTS saved_locations (
    id INTEGER PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    postcode TEXT,
    lat REAL,
    lon REAL,
    FOREIGN KEY(user_id) REFERENCES user_preferences(id)
);

-- Weather Cache
-- We store the raw JSON response from the provider for a specific location
CREATE TABLE IF NOT EXISTS weather_cache (
    location_key TEXT PRIMARY KEY, -- e.g. "2000-AU" or lat/lon
    data_json TEXT, -- The full WeatherData object serialized
    fetched_at INTEGER,
    expires_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);
