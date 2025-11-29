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

-- BOM Ingestion Tables

-- Locations (Areas/Cities)
CREATE TABLE IF NOT EXISTS bom_locations (
    aac TEXT PRIMARY KEY, -- e.g., "NSW_PT133"
    parent_aac TEXT,
    description TEXT, -- Name e.g. "Thredbo Top Station"
    type TEXT, -- e.g. "location", "metropolitan-area"
    updated_at INTEGER
);

-- Forecasts
CREATE TABLE IF NOT EXISTS bom_forecasts (
    id INTEGER PRIMARY KEY, -- Auto-increment
    aac TEXT,
    start_time_local TEXT, -- ISO8601
    end_time_local TEXT,
    min_temp REAL,
    max_temp REAL,
    precis TEXT,
    prob_precip TEXT, -- Stored as text "50%" or just "50". BOM gives "50%".
    precip_range TEXT,
    icon_code INTEGER,
    fetched_at INTEGER,
    UNIQUE(aac, start_time_local), -- Prevent duplicates for same slot
    FOREIGN KEY(aac) REFERENCES bom_locations(aac)
);

CREATE INDEX IF NOT EXISTS idx_bom_forecasts_aac ON bom_forecasts(aac);

-- Ingestion Logs
CREATE TABLE IF NOT EXISTS bom_ingestion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at INTEGER,
    completed_at INTEGER,
    status TEXT, -- 'running', 'success', 'failed'
    details TEXT -- JSON or text summary of what happened
);

-- Emergency Warnings
CREATE TABLE IF NOT EXISTS bom_warnings (
    id TEXT PRIMARY KEY, -- Unique identifier for the warning
    location_name TEXT NOT NULL,
    state TEXT,
    description TEXT NOT NULL,
    expiry_time INTEGER NOT NULL, -- Unix timestamp
    severity TEXT, -- e.g., 'Minor', 'Major', 'Severe'
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Geocoding Cache
CREATE TABLE IF NOT EXISTS geo_cache (
    location_name TEXT,
    state TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (location_name, state)
);
