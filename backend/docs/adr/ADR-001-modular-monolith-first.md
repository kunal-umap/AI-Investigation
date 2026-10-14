# ADR-001: Modular Monolith First Architecture

## Status
Accepted

## Date
2026-09-16

## Context
The AI Operations Investigator is an enterprise platform designed to ingest telemetry, correlate deployments and configuration changes, retrieve historical runbooks and incident knowledge, analyze evidence, and prepare human-in-the-loop investigation dossiers for on-call engineers.

During the initial design phase, the engineering team evaluated whether to build this as an ensemble of distributed microservices (e.g., separate services for Incidents, Telemetry, Investigation, Evidence, Changes, Knowledge) or as a strictly bounded modular monolith.

Distributed microservices introduce substantial operational and distributed-systems overhead early in a product lifecycle:
- Distributed transactions and eventual consistency challenges across evidence and incident lifecycle.
- Complex local development environments requiring service meshes or multiple orchestrators.
- Network latency, serialization overhead, and partial failure modes between tightly coupled domains.
- Complex CI/CD deployment pipelines before domain boundaries are hardened.

## Decision
We choose to implement a **Modular Monolith** with strict domain boundaries and package-by-feature architecture inside a single Java 21 / Spring Boot codebase.

Key structural rules enforced:
1. **Domain Isolation**: Top-level packages represent business boundaries: `incident`, `investigation`, `telemetry`, `knowledge`, `change`, `evidence`, `notification`, `auth`, and `common`.
2. **Hexagonal / Clean Layering**: Within each module, layers are strictly partitioned into:
   - `api` (Controllers, DTOs, Mappers)
   - `application` (Services, Inbound/Outbound Ports)
   - `domain` (Models, Value Objects, Domain Events, Repository Interfaces)
   - `infrastructure` (Persistence Adapters, External Integrations, Configuration)
3. **Dependency Rules**:
   - `domain` has zero dependencies on external frameworks (no Spring annotations in core domain models).
   - `controllers` invoke only application services, never domain directly and never repositories.
   - Modules communicate across boundaries exclusively via public interfaces/ports and decoupled asynchronous domain events.
4. **Independent Extractability**: Each module owns its schema tables and data access. No cross-module database joins are permitted in repository queries. This guarantees any module can be extracted into an independent microservice later without architectural rewrites.

## Consequences
### Positive
- High developer velocity and single-command local development (`./gradlew bootRun` or `docker compose up`).
- Transactional integrity within domain boundaries, with clear asynchronous decoupling between domains.
- Zero network hop latency for intra-process module interactions.
- Straightforward migration path to microservices if scaling requirements demand it.

### Negative / Trade-offs
- Requires discipline to prevent developers from bypassing module boundaries (enforced by ArchUnit tests and code reviews).
- Shared deployment lifecycle: deploying an update to one module redeploys the monolith (mitigated by fast startup and zero-downtime rolling deployments).
