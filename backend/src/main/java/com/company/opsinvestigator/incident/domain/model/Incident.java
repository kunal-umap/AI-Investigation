package com.company.opsinvestigator.incident.domain.model;

import com.company.opsinvestigator.common.exception.InvalidStateTransitionException;
import com.company.opsinvestigator.common.exception.OptimisticLockingException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Pure domain model for Incident.
 * Independent of any persistence or framework annotations.
 */
public class Incident {

    private final UUID id;
    private final String incidentKey;
    private String title;
    private String description;
    private IncidentStatus status;
    private IncidentSeverity severity;
    private final String environment;
    private final String serviceName;
    private final Instant detectedAt;
    private final Instant startedAt;
    private Instant resolvedAt;
    private final Instant createdAt;
    private Instant updatedAt;
    private Long version;

    public Incident(UUID id,
                    String incidentKey,
                    String title,
                    String description,
                    IncidentStatus status,
                    IncidentSeverity severity,
                    String environment,
                    String serviceName,
                    Instant detectedAt,
                    Instant startedAt,
                    Instant resolvedAt,
                    Instant createdAt,
                    Instant updatedAt,
                    Long version) {
        this.id = Objects.requireNonNull(id, "Incident id must not be null");
        this.incidentKey = Objects.requireNonNull(incidentKey, "IncidentKey must not be null");
        this.title = Objects.requireNonNull(title, "Title must not be null");
        this.description = Objects.requireNonNull(description, "Description must not be null");
        this.status = Objects.requireNonNull(status, "Status must not be null");
        this.severity = Objects.requireNonNull(severity, "Severity must not be null");
        this.environment = Objects.requireNonNull(environment, "Environment must not be null");
        this.serviceName = Objects.requireNonNull(serviceName, "ServiceName must not be null");
        this.detectedAt = Objects.requireNonNull(detectedAt, "DetectedAt must not be null");
        this.startedAt = Objects.requireNonNull(startedAt, "StartedAt must not be null");
        this.resolvedAt = resolvedAt;
        this.createdAt = Objects.requireNonNull(createdAt, "CreatedAt must not be null");
        this.updatedAt = Objects.requireNonNull(updatedAt, "UpdatedAt must not be null");
        this.version = version == null ? 0L : version;
    }

    public static Incident createNew(String incidentKey,
                                     String title,
                                     String description,
                                     IncidentSeverity severity,
                                     String environment,
                                     String serviceName,
                                     Instant startedAt) {
        Instant now = Instant.now();
        return new Incident(
                UUID.randomUUID(),
                incidentKey,
                title,
                description,
                IncidentStatus.DETECTED,
                severity,
                environment,
                serviceName,
                now,
                startedAt != null ? startedAt : now,
                null,
                now,
                now,
                0L
        );
    }

    public void updateStatus(IncidentStatus newStatus, long expectedVersion) {
        if (!Objects.equals(this.version, expectedVersion)) {
            throw new OptimisticLockingException(String.format(
                    "Incident %s version mismatch. Current version is %d, expected was %d",
                    id, this.version, expectedVersion));
        }

        validateTransition(this.status, newStatus);

        this.status = newStatus;
        this.updatedAt = Instant.now();
        if (newStatus == IncidentStatus.RESOLVED && this.resolvedAt == null) {
            this.resolvedAt = Instant.now();
        }
    }

    private void validateTransition(IncidentStatus current, IncidentStatus target) {
        if (current == target) {
            return;
        }

        if (current == IncidentStatus.CLOSED) {
            throw new InvalidStateTransitionException("Cannot transition from CLOSED state.");
        }

        switch (current) {
            case DETECTED -> {
                if (target != IncidentStatus.INVESTIGATING && target != IncidentStatus.MITIGATED && target != IncidentStatus.RESOLVED && target != IncidentStatus.CLOSED) {
                    throw new InvalidStateTransitionException(String.format("Invalid transition from %s to %s", current, target));
                }
            }
            case INVESTIGATING -> {
                if (target != IncidentStatus.MITIGATED && target != IncidentStatus.RESOLVED && target != IncidentStatus.CLOSED) {
                    throw new InvalidStateTransitionException(String.format("Invalid transition from %s to %s", current, target));
                }
            }
            case MITIGATED -> {
                if (target != IncidentStatus.RESOLVED && target != IncidentStatus.INVESTIGATING && target != IncidentStatus.CLOSED) {
                    throw new InvalidStateTransitionException(String.format("Invalid transition from %s to %s", current, target));
                }
            }
            case RESOLVED -> {
                if (target != IncidentStatus.CLOSED && target != IncidentStatus.INVESTIGATING) {
                    throw new InvalidStateTransitionException(String.format("Invalid transition from %s to %s", current, target));
                }
            }
        }
    }

    // Getters
    public UUID getId() { return id; }
    public String getIncidentKey() { return incidentKey; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public IncidentStatus getStatus() { return status; }
    public IncidentSeverity getSeverity() { return severity; }
    public String getEnvironment() { return environment; }
    public String getServiceName() { return serviceName; }
    public Instant getDetectedAt() { return detectedAt; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Long getVersion() { return version; }
}
