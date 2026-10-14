package com.company.opsinvestigator.investigation.infrastructure.persistence;

import com.company.opsinvestigator.investigation.domain.model.InvestigationHypothesis;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "investigation_hypotheses")
public class InvestigationHypothesisJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "investigation_id", nullable = false)
    private UUID investigationId;

    @Column(name = "hypothesis_text", nullable = false, columnDefinition = "TEXT")
    private String hypothesisText;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "evidence_references", columnDefinition = "TEXT")
    private String evidenceReferences;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    public InvestigationHypothesisJpaEntity() {}

    public static InvestigationHypothesisJpaEntity fromDomain(InvestigationHypothesis domain) {
        InvestigationHypothesisJpaEntity entity = new InvestigationHypothesisJpaEntity();
        entity.id = domain.id();
        entity.investigationId = domain.investigationId();
        entity.hypothesisText = domain.hypothesisText();
        entity.status = domain.status();
        entity.evidenceReferences = domain.evidenceReferences();
        entity.verifiedAt = domain.verifiedAt();
        return entity;
    }

    public InvestigationHypothesis toDomain() {
        return new InvestigationHypothesis(id, investigationId, hypothesisText, status, evidenceReferences, verifiedAt);
    }

    public UUID getId() { return id; }
    public UUID getInvestigationId() { return investigationId; }
    public String getHypothesisText() { return hypothesisText; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEvidenceReferences() { return evidenceReferences; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
}
