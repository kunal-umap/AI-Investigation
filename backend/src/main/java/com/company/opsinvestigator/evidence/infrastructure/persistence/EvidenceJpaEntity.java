package com.company.opsinvestigator.evidence.infrastructure.persistence;

import com.company.opsinvestigator.evidence.domain.model.Evidence;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "evidence")
public class EvidenceJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "type", nullable = false, length = 64)
    private String type;

    @Column(name = "source", nullable = false, length = 128)
    private String source;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "reference_id", nullable = false, length = 128)
    private String referenceId;

    @Column(name = "summary", nullable = false, length = 512)
    private String summary;

    @Column(name = "raw_reference", nullable = false, length = 1024)
    private String rawReference;

    @Column(name = "relevance_score", nullable = false)
    private double relevanceScore;

    @Column(name = "confidence", nullable = false)
    private double confidence;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public EvidenceJpaEntity() {}

    public static EvidenceJpaEntity fromDomain(Evidence evidence) {
        EvidenceJpaEntity entity = new EvidenceJpaEntity();
        entity.id = evidence.getId();
        entity.type = evidence.getType();
        entity.source = evidence.getSource();
        entity.timestamp = evidence.getTimestamp();
        entity.referenceId = evidence.getReferenceId();
        entity.summary = evidence.getSummary();
        entity.rawReference = evidence.getRawReference();
        entity.relevanceScore = evidence.getRelevanceScore();
        entity.confidence = evidence.getConfidence();
        entity.metadata = evidence.getMetadata();
        entity.createdAt = evidence.getCreatedAt();
        return entity;
    }

    public Evidence toDomain() {
        return new Evidence(
                this.id,
                this.type,
                this.source,
                this.timestamp,
                this.referenceId,
                this.summary,
                this.rawReference,
                this.relevanceScore,
                this.confidence,
                this.metadata,
                this.createdAt
        );
    }

    public UUID getId() { return id; }
    public String getType() { return type; }
    public String getSource() { return source; }
    public Instant getTimestamp() { return timestamp; }
    public String getReferenceId() { return referenceId; }
    public String getSummary() { return summary; }
    public String getRawReference() { return rawReference; }
    public double getRelevanceScore() { return relevanceScore; }
    public double getConfidence() { return confidence; }
    public String getMetadata() { return metadata; }
    public Instant getCreatedAt() { return createdAt; }
}
