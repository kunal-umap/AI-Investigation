package com.company.opsinvestigator.investigation.infrastructure.persistence;

import com.company.opsinvestigator.investigation.domain.model.InvestigationRecommendation;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "investigation_recommendations")
public class InvestigationRecommendationJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "investigation_id", nullable = false)
    private UUID investigationId;

    @Column(name = "action_category", nullable = false, length = 64)
    private String actionCategory;

    @Column(name = "recommendation_text", nullable = false, columnDefinition = "TEXT")
    private String recommendationText;

    @Column(name = "rationale", nullable = false, columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "is_actionable_by_human_only", nullable = false)
    private boolean isActionableByHumanOnly;

    public InvestigationRecommendationJpaEntity() {}

    public static InvestigationRecommendationJpaEntity fromDomain(InvestigationRecommendation domain) {
        InvestigationRecommendationJpaEntity entity = new InvestigationRecommendationJpaEntity();
        entity.id = domain.id();
        entity.investigationId = domain.investigationId();
        entity.actionCategory = domain.actionCategory();
        entity.recommendationText = domain.recommendationText();
        entity.rationale = domain.rationale();
        entity.isActionableByHumanOnly = domain.isActionableByHumanOnly();
        return entity;
    }

    public InvestigationRecommendation toDomain() {
        return new InvestigationRecommendation(id, investigationId, actionCategory, recommendationText, rationale, isActionableByHumanOnly);
    }

    public UUID getId() { return id; }
    public UUID getInvestigationId() { return investigationId; }
    public String getActionCategory() { return actionCategory; }
    public String getRecommendationText() { return recommendationText; }
    public String getRationale() { return rationale; }
    public boolean isActionableByHumanOnly() { return isActionableByHumanOnly; }
}
