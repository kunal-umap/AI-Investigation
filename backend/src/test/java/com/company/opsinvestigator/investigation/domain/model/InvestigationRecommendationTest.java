package com.company.opsinvestigator.investigation.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

class InvestigationRecommendationTest {

    @Test
    @DisplayName("Should enforce isActionableByHumanOnly=true to prevent autonomous mutations (ADR-003)")
    void shouldEnforceHumanActionOnly() {
        UUID investigationId = UUID.randomUUID();
        InvestigationRecommendation recommendation = InvestigationRecommendation.forHumanOperator(
                investigationId,
                "CONTAINER_RESTART",
                "Recommend rolling restart of pods in deployment payment-v2 due to memory leak",
                "Heap dump analysis confirms non-reclaimable Netty direct memory buffers"
        );

        assertTrue(recommendation.isActionableByHumanOnly(),
                "Recommendations MUST be strictly actionable by human operators only; autonomous execution is prohibited.");
    }
}
