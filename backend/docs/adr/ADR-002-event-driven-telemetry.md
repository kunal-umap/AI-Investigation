# ADR-002: Event-Driven Telemetry and Metadata-Only Storage

## Status
Accepted

## Date
2026-09-16

## Context
High-throughput telemetry (distributed tracing, application logs, container metrics, and database observation queries) generates massive volumes of operational data during production incidents. Storing raw log payloads and full metric time-series streams directly into relational PostgreSQL tables creates severe database bloat, indexing degradation, write saturation, and high storage costs.

Furthermore, ingestion of events from monitoring agents, CI/CD pipelines, and cloud telemetry must be non-blocking and decoupled from incident and investigation lifecycles.

## Decision
We adopt an **Event-Driven Telemetry Architecture** with a strict **Metadata and Reference-Only Relational Persistence** policy:

1. **Kafka as High-Throughput Event Spine**:
   - `ops.telemetry.logs`: Ingests structured log event summaries and references.
   - `ops.telemetry.metrics`: Ingests periodic metric snapshots and anomaly alerts.
   - `ops.telemetry.db`: Ingests slow query and deadlock observations.
   - `ops.change.detected`: Ingests deployment, configuration, and PR events.
   - `ops.incident.detected` & `ops.incident.updated`: Ingests incident lifecycle state transitions.
   - `ops.investigation.requested` & `ops.investigation.completed`: Ingests investigation orchestration events.
   - Dead-letter and retry topics are provisioned following the convention: `<topic-name>.retry` and `<topic-name>.DLT`.

2. **Metadata & Reference-Only Persistence**:
   - PostgreSQL stores only structured metadata, timestamps, anomaly scores, confidence levels, and immutable references (e.g., S3/GCS Object Storage URIs, Datadog/CloudWatch query pointers, OpenTelemetry trace/span IDs).
   - Raw multi-megabyte log payloads are never stored inside relational columns.

3. **Telemetry Query Port Abstraction**:
   - Domain modules query telemetry via the `TelemetryQueryPort`, abstracting whether logs originate from Kafka topics, S3 log cold storage, or live log search engines.

## Consequences
### Positive
- Predictable PostgreSQL storage footprint and fast indexing operations.
- Fault-tolerant ingestion with backpressure handling via Kafka consumer groups.
- Decoupled modules that react to telemetry anomalies without synchronous RPC coupling.

### Negative / Trade-offs
- Deep log retrieval requires dereferencing external storage URLs or external search APIs.
- Eventual consistency between telemetry arrival and evidence correlation.
