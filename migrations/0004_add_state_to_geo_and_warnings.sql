-- Migration 0004: Add state to warnings and geocoding cache

-- Add state column to bom_warnings
ALTER TABLE bom_warnings ADD COLUMN state TEXT;

-- Recreate geo_cache with state column and composite primary key
DROP TABLE IF EXISTS geo_cache;
CREATE TABLE geo_cache (
    location_name TEXT NOT NULL,
    state TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (location_name, state)
);
