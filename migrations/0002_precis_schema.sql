-- Migration number: 0002 	 2025-11-29T01:29:00.000Z
-- Precis Schema Updates
-- Add support for hierarchical areas, comprehensive metadata, and flexible element storage
-- NOTE: This is a BREAKING CHANGE - existing forecast data will be cleared

-- Drop existing tables (breaking change - will be repopulated on next ingestion)
DROP TABLE IF EXISTS bom_forecasts;
DROP TABLE IF EXISTS bom_locations;

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


