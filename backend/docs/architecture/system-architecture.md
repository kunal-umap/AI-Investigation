# AI Operations Investigator - System Architecture Document

## 1. Executive Summary
The AI Operations Investigator is an enterprise-grade, read-only incident investigation platform. Its primary objective is to act as an uncompromised, safe investigation assistant that ingests telemetry, correlates recent code/configuration deployments, analyzes historical incident runbooks, correlates multi-modal evidence, and prepares structured investigation dossiers for on-call engineers.

**Guiding Axiom**: *The system must NEVER autonomously change, restart, rollback, modify, or execute commands against production systems. It collects, correlates, analyzes, and assists human operators.*

---

## 2. High-Level Modular Monolith Architecture

The backend is structured as a modular monolith adhering to Clean/Hexagonal Architecture principles. Every top-level domain operates within an explicit bounded context with zero circular dependencies.

```
                          ┌─────────────────────────────────────┐
                          │         REST / OpenAPI Gateway      │
                          │        (Spring Security / JWT)      │
                          └──────────────────┬──────────────────┘
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
┌─────▼────────┐                     ┌───────▼───────┐                     ┌────────▼───────┐
│   incident   │◄─── Domain Event ───┤ investigation │◄─── Domain Event ───┤    evidence    │
│    Module    │    (Internal Bus/   │    Module     │    (Internal Bus/   │     Module     │
│              │        Kafka)       │               │        Kafka)       │                │
└──────┬───────┘                     └───────┬───────┘                     └────────┬───────┘
       │                                     │                                      │
       │                                     │ (Queries telemetry & changes)        │
       │                                     │                                      │
┌──────▼───────┐                     ┌───────▼───────┐                     ┌────────▼───────┐
│  telemetry   │                     │    change     │                     │   knowledge    │
│    Module    │                     │    Module     │                     │     Module     │
│(Metadata-only│                     │(Deployments,  │                     │(Runbooks,      │
│  relational) │                     │Config, Commits│                     │ Historical Inc)│
└──────────────┘                     └───────────────┘                     └────────────────┘
```

---

## 3. Module Breakdown & Domain Responsibilities

| Module | Core Purpose | Key Entities & Value Objects | Inbound/Outbound Ports |
| :--- | :--- | :--- | :--- |
| **incident** | Incident lifecycle management, state transitions, timeline generation, and event publishing. | `Incident`, `IncidentEvent`, `IncidentEvidence`, `IncidentTag`, `IncidentAssignment`, `IncidentTimelineEntry` | `IncidentRepository`, `IncidentUseCasePort`, `EventPublisher` |
| **investigation** | Investigation lifecycle orchestration, hypothesis generation, and actionable recommendations. | `Investigation`, `InvestigationFinding`, `InvestigationHypothesis`, `InvestigationRecommendation` | `InvestigationRepository`, `TelemetryQueryPort`, `ChangeQueryPort`, `KnowledgeRepository` |
| **evidence** | Evidence metadata indexing, relevance scoring, and cold-storage pointer management. | `Evidence`, `EvidenceType`, `RelevanceScore`, `ConfidenceLevel` | `EvidenceRepository`, `EvidenceIngestionPort` |
| **telemetry** | High-throughput telemetry event metadata, metric anomalies, log pointers, DB observations. | `TelemetrySource`, `TelemetryEvent`, `MetricSnapshot`, `LogEvent`, `DatabaseObservation`, `ServerObservation` | `TelemetryQueryPort`, `TelemetryIngestionPort` |
| **change** | Correlation of deployments, configuration changes, and merged pull requests. | `DeploymentEvent`, `ConfigurationChange`, `CodeChange` | `ChangeQueryPort`, `ChangeIngestionPort` |
| **knowledge** | Runbook repository, postmortem archive, and historical incident pattern matching. | `KnowledgeDocument`, `Runbook`, `HistoricalIncident`, `Postmortem` | `KnowledgeRepository`, `KnowledgeSearchPort` |
| **notification**| SRE alerts, incident notification channels (Slack/PagerDuty/Email), read-only webhooks. | `NotificationRule`, `NotificationDispatch` | `NotificationPort` |
| **auth** | OAuth2/JWT security tokens, RBAC roles (VIEWER, INVESTIGATOR, LEAD_SRE, ADMIN), audit logs. | `UserPrincipal`, `Role`, `AuditLogEntry` | `TokenVerificationPort`, `AuditLogPort` |
| **common** | Cross-cutting generic utilities, RFC 7807 Problem Details, Trace/Correlation ID filter, Base Entities. | `AuditableEntity`, `ProblemDetailsException`, `CorrelationIdFilter` | Generic only |

---

## 4. Architectural Rules & Invariants

1. **Dependency Inversion**:
   - `Controllers` depend solely on `Application Services`.
   - `Application Services` depend on `Domain Models` and `Domain Ports` (interfaces).
   - `Infrastructure` implements the domain/application ports (e.g., `PostgresIncidentRepository` implements `IncidentRepository`).
   - Domain layer models must not import any Spring, Hibernate, or infrastructure annotations.
2. **Persistence Boundary Rule**:
   - PostgreSQL stores metadata, timestamps, keys, scores, and storage references.
   - Raw multi-megabyte log payloads are never stored inside relational columns. They reside in object storage or external log indices.
3. **Optimistic Locking**:
   - Core mutating entities (`Incident`, `Investigation`) leverage version fields (`@Version` / `version BIGINT DEFAULT 0`) to prevent concurrent modification race conditions during fast-moving incidents.
4. **Idempotence & Distributed Identifiers**:
   - All primary keys use RFC 4122 UUIDv4 identifiers.
   - Business keys (e.g., `incidentKey`: `INC-2026-0001`) are unique and immutable once generated.

---

## 5. Event-Driven Messaging & Kafka Topic Design

| Topic Name | Purpose | Partition Key | Retention Policy |
| :--- | :--- | :--- | :--- |
| `ops.incident.detected` | Published when an incident is opened | `incidentKey` | 90 days |
| `ops.incident.updated` | Published on incident status/severity changes | `incidentKey` | 90 days |
| `ops.investigation.requested` | Requests automated evidence collection | `incidentId` | 30 days |
| `ops.investigation.completed` | Notifies that investigation dossier is ready | `incidentId` | 30 days |
| `ops.telemetry.logs` | Ingests structured log references | `serviceName` | 7 days (metadata) |
| `ops.telemetry.metrics` | Ingests metric anomaly snapshots | `serviceName` | 14 days |
| `ops.telemetry.db` | Ingests database query observation events | `dbInstanceId` | 14 days |
| `ops.change.detected` | Ingests deployment and config change notices | `serviceName` | 180 days |

### Retry and Dead-Letter Topic Convention
For every consumer topic `ops.<domain>.<event>`:
- Retry Topic: `ops.<domain>.<event>.retry` (configured with exponential backoff)
- Dead Letter Topic (DLT): `ops.<domain>.<event>.DLT` (configured for manual SRE dead-letter inspection)

---

## 6. Observability & Security

- **OpenTelemetry-Ready**: All HTTP requests are stamped with `X-Correlation-Id` and `X-Trace-Id` via a high-performance Servlet filter and propagated to SLF4J MDC.
- **Structured JSON Logging**: Production profile outputs logstash/Logback JSON events containing `timestamp`, `level`, `trace_id`, `correlation_id`, `logger`, `thread`, and `message`.
- **RFC 7807 Problem Details**: Standardized error responses with `type`, `title`, `status`, `detail`, `instance`, and `timestamp`.
- **Spring Actuator**:
  - `GET /actuator/health`: Readiness and liveness probes.
  - `GET /actuator/info`: Git commit hash, build version, and platform metadata.
