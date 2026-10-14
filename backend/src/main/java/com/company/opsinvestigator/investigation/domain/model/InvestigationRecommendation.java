package com.company.opsinvestigator.investigation.domain.model;

import java.util.UUID;

public record InvestigationRecommendation(
        UUID id,
        UUID investigationId,
        String actionCategory,
        String recommendationText,
        String rationale,
        boolean isActionableByHumanOnly
) {
    public static InvestigationRecommendation forHumanOperator(UUID investigationId, String category, String text, String rationale) {
        // Enforces read-only safety guardrail: isActionableByHumanOnly is strictly true
        return new InvestigationRecommendation(
                UUID.randomUUID(),
                investigationId,
                category,
                text,
                rationale,
                true
        );
    }
}
