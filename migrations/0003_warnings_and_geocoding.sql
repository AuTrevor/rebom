-- Migration 0003: Warnings and Geocoding Cache

-- Emergency Warnings
CREATE TABLE IF NOT EXISTS bom_warnings (
    id TEXT PRIMARY KEY, -- Unique identifier for the warning
    location_name TEXT NOT NULL,
    description TEXT NOT NULL,
    expiry_time INTEGER NOT NULL, -- Unix timestamp
    severity TEXT, -- e.g., 'Minor', 'Major', 'Severe'
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Geocoding Cache
CREATE TABLE IF NOT EXISTS geo_cache (
    location_name TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
