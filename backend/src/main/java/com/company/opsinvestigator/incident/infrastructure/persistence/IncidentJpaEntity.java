package com.company.opsinvestigator.incident.infrastructure.persistence;

import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class IncidentJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "incident_key", nullable = false, unique = true, length = 64)
    private String incidentKey;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private IncidentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 32)
    private IncidentSeverity severity;

    @Column(name = "environment", nullable = false, length = 64)
    private String environment;

    @Column(name = "service_name", nullable = false, length = 128)
    private String serviceName;

    @Column(name = "detected_at", nullable = false)
    private Instant detectedAt;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    public IncidentJpaEntity() {}

    public static IncidentJpaEntity fromDomain(Incident domain) {
        IncidentJpaEntity entity = new IncidentJpaEntity();
        entity.id = domain.getId();
        entity.incidentKey = domain.getIncidentKey();
        entity.title = domain.getTitle();
        entity.description = domain.getDescription();
        entity.status = domain.getStatus();
        entity.severity = domain.getSeverity();
        entity.environment = domain.getEnvironment();
        entity.serviceName = domain.getServiceName();
        entity.detectedAt = domain.getDetectedAt();
        entity.startedAt = domain.getStartedAt();
        entity.resolvedAt = domain.getResolvedAt();
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        entity.version = domain.getVersion();
        return entity;
    }

    public Incident toDomain() {
        return new Incident(
                this.id,
                this.incidentKey,
                this.title,
                this.description,
                this.status,
                this.severity,
                this.environment,
                this.serviceName,
                this.detectedAt,
                this.startedAt,
                this.resolvedAt,
                this.createdAt,
                this.updatedAt,
                this.version
        );
    }

    // Getters and Setters
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
