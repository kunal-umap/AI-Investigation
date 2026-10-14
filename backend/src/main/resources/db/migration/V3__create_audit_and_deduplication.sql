-- =========================================================================
-- Stage 2: Deduplication Tracking and Audit Logging Schema
-- =========================================================================

CREATE TABLE IF NOT EXISTS ingested_telemetry_events (
    event_id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    source VARCHAR(128) NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingested_events_service_time
    ON ingested_telemetry_events (service_name, received_at DESC);

CREATE TABLE IF NOT EXISTS audit_records (
    id UUID PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    actor VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(128) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_records_target
    ON audit_records (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_audit_records_created
    ON audit_records (created_at DESC);
