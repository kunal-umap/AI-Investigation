# ADR-003: Human-in-the-Loop and Read-Only Production Safety Guardrails

## Status
Accepted

## Date
2026-09-16

## Context
Production incidents occur under high stress and time pressure. Autonomous remediation systems that attempt automated rollback, server restarts, configuration modification, or command execution risk compounding catastrophic outages (e.g., executing an errant restart during database failover or clearing caches during a network partition).

The core mission of the AI Operations Investigator is to act as an uncompromised, safe assistant that collects telemetry, correlates changes, analyzes evidence, proposes hypotheses, and prepares an actionable investigation dossier exclusively for human engineers.

## Decision
We enforce a strict, architectural **Read-Only Non-Destructive Guarantee**:

1. **Zero Autonomous Write / Mutation to Production**:
   - The platform MUST NEVER possess write, mutation, restart, rollback, or command execution privileges against production clusters, cloud infrastructure, or databases.
   - All integrations (OpenTelemetry, Prometheus, CloudWatch, PostgreSQL observers, Kubernetes/cloud connectors) are authenticated with strictly read-only service accounts or read replicas.

2. **Human-in-the-Loop Decision Boundary**:
   - The investigation engine only produces `InvestigationFinding`, `InvestigationHypothesis`, and `InvestigationRecommendation`.
   - Recommendations are explicitly flagged with `isActionableByHumanOnly = true`.
   - Any remediation step must be reviewed, confirmed, and executed manually by authorized on-call engineers via verified change management runbooks.

3. **Software Guardrails**:
   - Security configurations reject any API or background job configured with operational execution endpoints.
   - Runbooks retrieved from the knowledge domain are strictly flagged with `isReadOnlySafe`.

## Consequences
### Positive
- Absolute safety: The investigator platform cannot cause, exacerbate, or trigger a production outage.
- High trust among SRE and Platform Engineering teams.
- Seamless compliance with enterprise SOC2, ISO 27001, and least-privilege security controls.

### Negative / Trade-offs
- Mean Time to Recovery (MTTR) relies on human response time, which is mitigated by delivering pre-compiled evidence and high-confidence hypotheses instantly upon incident detection.
