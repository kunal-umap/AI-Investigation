package com.company.opsinvestigator.investigation.infrastructure.persistence;

import com.company.opsinvestigator.investigation.domain.model.InvestigationFinding;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "investigation_findings")
public class InvestigationFindingJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "investigation_id", nullable = false)
    private UUID investigationId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "category", nullable = false, length = 64)
    private String category;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "confidence_score", nullable = false)
    private double confidenceScore;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    public InvestigationFindingJpaEntity() {}

    public static InvestigationFindingJpaEntity fromDomain(InvestigationFinding domain) {
        InvestigationFindingJpaEntity entity = new InvestigationFindingJpaEntity();
        entity.id = domain.id();
        entity.investigationId = domain.investigationId();
        entity.title = domain.title();
        entity.category = domain.category();
        entity.description = domain.description();
        entity.confidenceScore = domain.confidenceScore();
        entity.timestamp = domain.timestamp();
        return entity;
    }

    public InvestigationFinding toDomain() {
        return new InvestigationFinding(id, investigationId, title, category, description, confidenceScore, timestamp);
    }

    public UUID getId() { return id; }
    public UUID getInvestigationId() { return investigationId; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public double getConfidenceScore() { return confidenceScore; }
    public Instant getTimestamp() { return timestamp; }
}
