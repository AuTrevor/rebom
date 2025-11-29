-- schema.sql
-- AusWeather Core Database Schema
-- Combined schema from migrations 0001-0004

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

-- BOM Metadata Table (AMOC section data)
CREATE TABLE IF NOT EXISTS bom_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    state TEXT,
    region TEXT,
    office TEXT,
    sender TEXT,
    copyright TEXT,
    disclaimer TEXT,
    issue_time_utc TEXT,
    issue_time_local TEXT,
    issue_time_local_tz TEXT,
    sent_time TEXT,
    expiry_time TEXT,
    validity_bgn_time_local TEXT,
    validity_bgn_time_local_tz TEXT,
    validity_end_time_local TEXT,
    validity_end_time_local_tz TEXT,
    next_routine_issue_time_utc TEXT,
    next_routine_issue_time_local TEXT,
    next_routine_issue_time_local_tz TEXT,
    status TEXT,
    service TEXT,
    sub_service TEXT,
    product_type TEXT,
    phase TEXT,
    fetched_at INTEGER,
    UNIQUE(product_id, issue_time_utc)
);

CREATE INDEX IF NOT EXISTS idx_bom_metadata_product ON bom_metadata(product_id, fetched_at);
CREATE INDEX IF NOT EXISTS idx_bom_metadata_expiry ON bom_metadata(expiry_time);

-- BOM Locations (with hierarchy support)
CREATE TABLE IF NOT EXISTS bom_locations (
    aac TEXT PRIMARY KEY,
    parent_aac TEXT,
    description TEXT,
    type TEXT,
    level TEXT, -- 'region', 'district', or 'location'
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bom_locations_level ON bom_locations(level);
CREATE INDEX IF NOT EXISTS idx_bom_locations_parent ON bom_locations(parent_aac);
CREATE INDEX IF NOT EXISTS idx_bom_locations_type ON bom_locations(type);

-- BOM Forecasts (with flexible element storage)
CREATE TABLE IF NOT EXISTS bom_forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aac TEXT NOT NULL,
    period_index INTEGER,
    start_time_local TEXT NOT NULL,
    end_time_local TEXT,
    start_time_utc TEXT,
    end_time_utc TEXT,
    
    -- Specific columns for backward compatibility
    min_temp REAL,
    max_temp REAL,
    precis TEXT,
    prob_precip TEXT,
    precip_range TEXT,
    icon_code INTEGER,
    
    -- Flexible JSON storage
    elements TEXT,
    texts TEXT,
    
    fetched_at INTEGER,
    
    UNIQUE(aac, start_time_local)
);

CREATE INDEX IF NOT EXISTS idx_bom_forecasts_aac ON bom_forecasts(aac);
CREATE INDEX IF NOT EXISTS idx_bom_forecasts_period ON bom_forecasts(aac, period_index);
CREATE INDEX IF NOT EXISTS idx_bom_forecasts_time ON bom_forecasts(start_time_local);

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
    location_name TEXT NOT NULL,
    state TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (location_name, state)
);
