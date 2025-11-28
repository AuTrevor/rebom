-- schema.sql
-- AusWeather Core Database Schema
-- Phase 1 & 4 Requirements

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY, -- user_id (e.g., UUID or Cloudflare Access ID)
    unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
    default_location_id INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Saved Locations
CREATE TABLE IF NOT EXISTS saved_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL, -- User defined name or place name
    postcode TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY(user_id) REFERENCES user_preferences(id) ON DELETE CASCADE
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
