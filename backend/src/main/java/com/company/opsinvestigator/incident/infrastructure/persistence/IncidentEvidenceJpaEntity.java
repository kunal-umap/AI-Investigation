package com.company.opsinvestigator.incident.infrastructure.persistence;

import com.company.opsinvestigator.incident.domain.model.IncidentEvidence;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incident_evidence")
public class IncidentEvidenceJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "evidence_id", nullable = false)
    private UUID evidenceId;

    @Column(name = "relation_type", nullable = false, length = 64)
    private String relationType;

    @Column(name = "relevance_score", nullable = false)
    private double relevanceScore;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "linked_at", nullable = false)
    private Instant linkedAt;

    public IncidentEvidenceJpaEntity() {}

    public static IncidentEvidenceJpaEntity fromDomain(IncidentEvidence evidence) {
        IncidentEvidenceJpaEntity entity = new IncidentEvidenceJpaEntity();
        entity.id = evidence.id();
        entity.incidentId = evidence.incidentId();
        entity.evidenceId = evidence.evidenceId();
        entity.relationType = evidence.relationType();
        entity.relevanceScore = evidence.relevanceScore();
        entity.notes = evidence.notes();
        entity.linkedAt = evidence.linkedAt();
        return entity;
    }

    public IncidentEvidence toDomain() {
        return new IncidentEvidence(
                this.id,
                this.incidentId,
                this.evidenceId,
                this.relationType,
                this.relevanceScore,
                this.notes,
                this.linkedAt
        );
    }

    public UUID getId() { return id; }
    public UUID getIncidentId() { return incidentId; }
    public UUID getEvidenceId() { return evidenceId; }
    public String getRelationType() { return relationType; }
    public double getRelevanceScore() { return relevanceScore; }
    public String getNotes() { return notes; }
    public Instant getLinkedAt() { return linkedAt; }
}
