package com.company.opsinvestigator.investigation.infrastructure.persistence;

import com.company.opsinvestigator.investigation.domain.model.Investigation;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "investigations")
public class InvestigationJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "lead_investigator", length = 128)
    private String leadInvestigator;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    public InvestigationJpaEntity() {}

    public static InvestigationJpaEntity fromDomain(Investigation domain) {
        InvestigationJpaEntity entity = new InvestigationJpaEntity();
        entity.id = domain.getId();
        entity.incidentId = domain.getIncidentId();
        entity.status = domain.getStatus();
        entity.leadInvestigator = domain.getLeadInvestigator();
        entity.startedAt = domain.getStartedAt();
        entity.completedAt = domain.getCompletedAt();
        entity.summary = domain.getSummary();
        entity.version = domain.getVersion();
        return entity;
    }

    public Investigation toDomain() {
        return new Investigation(
                this.id,
                this.incidentId,
                this.status,
                this.leadInvestigator,
                this.startedAt,
                this.completedAt,
                this.summary,
                this.version
        );
    }

    public UUID getId() { return id; }
    public UUID getIncidentId() { return incidentId; }
    public String getStatus() { return status; }
    public String getLeadInvestigator() { return leadInvestigator; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public String getSummary() { return summary; }
    public Long getVersion() { return version; }
}
