# SRE Runbook: Incident Investigation with AI Operations Investigator

## 1. Overview
The **AI Operations Investigator** is designed as a read-only platform to accelerate Mean Time to Triage (MTTT) and Mean Time to Root Cause (MTTR) during production incidents.

### Fundamental Principle
**Never rely on this system to automatically execute production changes.** All recovery actions (restarts, scale-ups, rollbacks, cache flushes, DNS reroutes) must be validated and executed manually by authorized SREs in accordance with change management policies.

---

## 2. Inbound Incident Workflow

```
[ Monitoring Alert (Prometheus/CloudWatch) ]
                   │
                   ▼
       POST /api/v1/incidents
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
Published to Kafka       Stored in PostgreSQL
`ops.incident.detected`   (metadata & status DETECTED)
       │
       ▼
Investigation Engine:
1. Queries ChangeQueryPort for deployments in (-60m, +15m) window.
2. Queries TelemetryQueryPort for metric anomalies & log error bursts.
3. Retrieves relevant historical runbooks via KnowledgeRepository.
4. Synthesizes Evidence metadata (log pointers in object storage).
5. Prepares structured Investigation Hypotheses for human review.
```

---

## 3. Investigating via API

### Step 1: Inspect Incident Details
```bash
curl -s http://localhost:8080/api/v1/incidents/{incidentId} | jq .
```

### Step 2: Review Correlated Timeline
```bash
curl -s http://localhost:8080/api/v1/incidents/{incidentId}/timeline | jq .
```
Examine entries tagged as `DEPLOYMENT_CORRELATION`, `METRIC_ANOMALY`, or `STATE_TRANSITION`.

### Step 3: Inspect Correlated Evidence
```bash
curl -s http://localhost:8080/api/v1/incidents/{incidentId}/evidence | jq .
```
Notice that each evidence item provides `rawReference` (e.g. S3 pointer or query ID), preserving relational database performance while enabling deep-dive log analysis.

### Step 4: Update Status with Optimistic Lock
When acknowledging the incident:
```bash
curl -X PATCH http://localhost:8080/api/v1/incidents/{incidentId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVESTIGATING",
    "reason": "SRE on-call engineer acknowledged alert",
    "expectedVersion": 0
  }'
```
If another engineer or pipeline has already transitioned the incident, an HTTP 409 Conflict will be safely returned to prevent concurrent state overwrite.

---

## 4. Troubleshooting & Health
- Check readiness & liveness: `curl http://localhost:8080/actuator/health`
- Check metadata: `curl http://localhost:8080/actuator/info`
- Structured logs: Check logs for correlation ID (`X-Correlation-Id`) to trace any request across all log entries.
