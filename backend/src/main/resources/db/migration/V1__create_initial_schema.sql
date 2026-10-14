-- =========================================================================
-- Stage 1: AI Operations Investigator - Core Database Schema
-- Standard: PostgreSQL 15+, UTC Timestamps, UUID Primary Keys, Metadata-Only
-- =========================================================================

-- 1. Incident Domain
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY,
    incident_key VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_incidents_key UNIQUE (incident_key)
);

CREATE TABLE IF NOT EXISTS incident_events (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    actor VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_evidence (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL,
    relation_type VARCHAR(64) NOT NULL,
    relevance_score DOUBLE PRECISION NOT NULL,
    notes TEXT,
    linked_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_tags (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    tag_key VARCHAR(64) NOT NULL,
    tag_value VARCHAR(128) NOT NULL,
    CONSTRAINT uq_incident_tag UNIQUE (incident_id, tag_key)
);

CREATE TABLE IF NOT EXISTS incident_assignments (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    assignee_id VARCHAR(64) NOT NULL,
    assignee_name VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_timeline_entries (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_type VARCHAR(64) NOT NULL,
    summary VARCHAR(255) NOT NULL,
    description TEXT,
    source_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 2. Evidence Domain (Metadata and Storage Pointers - No heavy raw logs in SQL)
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    source VARCHAR(128) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_id VARCHAR(128) NOT NULL,
    summary VARCHAR(512) NOT NULL,
    raw_reference VARCHAR(1024) NOT NULL,
    relevance_score DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Telemetry Domain (Metadata-only persistence)
CREATE TABLE IF NOT EXISTS telemetry_sources (
    id UUID PRIMARY KEY,
    source_name VARCHAR(128) NOT NULL UNIQUE,
    source_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    config_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry_events (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES telemetry_sources(id),
    event_type VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    payload_ref VARCHAR(512) NOT NULL,
    raw_storage_ref VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS metric_snapshots (
    id UUID PRIMARY KEY,
    metric_name VARCHAR(128) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) NOT NULL,
    labels TEXT,
    anomaly_score DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS log_events (
    id UUID PRIMARY KEY,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    log_level VARCHAR(16) NOT NULL,
    message_sample VARCHAR(1024) NOT NULL,
    log_storage_url VARCHAR(1024) NOT NULL,
    query_ref VARCHAR(255),
    trace_id VARCHAR(64),
    span_id VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS database_observations (
    id UUID PRIMARY KEY,
    db_instance_id VARCHAR(128) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    query_sample VARCHAR(1024),
    execution_time_ms BIGINT NOT NULL,
    deadlocks_detected INT DEFAULT 0,
    connection_pool_usage_pct DOUBLE PRECISION NOT NULL,
    raw_ref VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS server_observations (
    id UUID PRIMARY KEY,
    host_or_pod_name VARCHAR(128) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    cpu_usage_pct DOUBLE PRECISION NOT NULL,
    memory_usage_pct DOUBLE PRECISION NOT NULL,
    disk_usage_pct DOUBLE PRECISION NOT NULL,
    status VARCHAR(32) NOT NULL
);

-- 4. Change Domain
CREATE TABLE IF NOT EXISTS deployment_events (
    id UUID PRIMARY KEY,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    version_tag VARCHAR(64) NOT NULL,
    commit_sha VARCHAR(64) NOT NULL,
    deployed_by VARCHAR(128) NOT NULL,
    deployed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) NOT NULL,
    change_url VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS configuration_changes (
    id UUID PRIMARY KEY,
    service_name VARCHAR(128) NOT NULL,
    environment VARCHAR(64) NOT NULL,
    config_key VARCHAR(128) NOT NULL,
    previous_hash VARCHAR(64),
    new_hash VARCHAR(64) NOT NULL,
    changed_by VARCHAR(128) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS code_changes (
    id UUID PRIMARY KEY,
    repository VARCHAR(255) NOT NULL,
    pull_request_number INT,
    commit_sha VARCHAR(64) NOT NULL,
    author VARCHAR(128) NOT NULL,
    merged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT NOT NULL
);

-- 5. Knowledge Domain
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    content_ref VARCHAR(512) NOT NULL,
    tags VARCHAR(255),
    version INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS runbooks (
    id UUID PRIMARY KEY,
    service_name VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    trigger_condition VARCHAR(255) NOT NULL,
    step_instructions_ref VARCHAR(512) NOT NULL,
    is_read_only_safe BOOLEAN NOT NULL DEFAULT TRUE,
    last_verified_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS historical_incidents (
    id UUID PRIMARY KEY,
    original_incident_key VARCHAR(64) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    root_cause_summary TEXT NOT NULL,
    resolution_summary TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recurrence_count INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS postmortems (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    title VARCHAR(255) NOT NULL,
    owner VARCHAR(128) NOT NULL,
    timeline_summary TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    corrective_actions_summary TEXT NOT NULL,
    document_url VARCHAR(512),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 6. Investigation Domain
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL,
    lead_investigator VARCHAR(128),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    summary TEXT,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS investigation_findings (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS investigation_hypotheses (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    hypothesis_text TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    evidence_references TEXT,
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS investigation_recommendations (
    id UUID PRIMARY KEY,
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    action_category VARCHAR(64) NOT NULL,
    recommendation_text TEXT NOT NULL,
    rationale TEXT NOT NULL,
    is_actionable_by_human_only BOOLEAN NOT NULL DEFAULT TRUE
);
