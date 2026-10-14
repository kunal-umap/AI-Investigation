-- =========================================================================
-- Stage 1: Deliberate Database Indexes & Constraints
-- =========================================================================

-- 1. Incident Domain Indexes
-- Filtering incidents by status and severity during triage
CREATE INDEX IF NOT EXISTS idx_incidents_status_severity
    ON incidents (status, severity);

-- Incident lookup by service name, environment and start time
CREATE INDEX IF NOT EXISTS idx_incidents_service_env_start
    ON incidents (service_name, environment, started_at DESC);

-- Incident temporal queries (recent incidents first)
CREATE INDEX IF NOT EXISTS idx_incidents_started_at
    ON incidents (started_at DESC);

-- Incident key unique lookup index
CREATE INDEX IF NOT EXISTS idx_incidents_key
    ON incidents (incident_key);

-- Incident related children lookups
CREATE INDEX IF NOT EXISTS idx_incident_events_incident_time
    ON incident_events (incident_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_incident_evidence_incident
    ON incident_evidence (incident_id, relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_incident_timeline_incident_time
    ON incident_timeline_entries (incident_id, timestamp ASC);

CREATE INDEX IF NOT EXISTS idx_incident_assignments_incident
    ON incident_assignments (incident_id);

-- 2. Evidence Domain Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_type_time
    ON evidence (type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_ref_id
    ON evidence (reference_id);

-- 3. Telemetry Domain Indexes (Telemetry timestamp, service name, environment)
CREATE INDEX IF NOT EXISTS idx_telemetry_events_service_env_time
    ON telemetry_events (service_name, environment, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_metric_snapshots_service_metric_time
    ON metric_snapshots (service_name, metric_name, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_log_events_service_env_time_level
    ON log_events (service_name, environment, timestamp DESC, log_level);

CREATE INDEX IF NOT EXISTS idx_log_events_trace_span
    ON log_events (trace_id, span_id);

CREATE INDEX IF NOT EXISTS idx_db_observations_service_time
    ON database_observations (service_name, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_server_observations_service_host_time
    ON server_observations (service_name, host_or_pod_name, timestamp DESC);

-- 4. Change Domain Indexes (Deployment timestamp, service, env)
CREATE INDEX IF NOT EXISTS idx_deployment_events_service_env_time
    ON deployment_events (service_name, environment, deployed_at DESC);

CREATE INDEX IF NOT EXISTS idx_config_changes_service_env_time
    ON configuration_changes (service_name, environment, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_code_changes_repo_time
    ON code_changes (repository, merged_at DESC);

-- 5. Knowledge Domain Indexes
CREATE INDEX IF NOT EXISTS idx_runbooks_service
    ON runbooks (service_name);

CREATE INDEX IF NOT EXISTS idx_historical_incidents_service
    ON historical_incidents (service_name, resolved_at DESC);

-- 6. Investigation Domain Indexes (Investigation incident id)
CREATE INDEX IF NOT EXISTS idx_investigations_incident_id
    ON investigations (incident_id, status);

CREATE INDEX IF NOT EXISTS idx_investigation_findings_inv_id
    ON investigation_findings (investigation_id, confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_investigation_hypotheses_inv_id
    ON investigation_hypotheses (investigation_id, status);

CREATE INDEX IF NOT EXISTS idx_investigation_recommendations_inv_id
    ON investigation_recommendations (investigation_id, action_category);
