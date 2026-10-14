package com.company.opsinvestigator.investigation.domain.model;

import java.time.Instant;
import java.util.UUID;

public record InvestigationFinding(
        UUID id,
        UUID investigationId,
        String title,
        String category,
        String description,
        double confidenceScore,
        Instant timestamp
) {
    public static InvestigationFinding create(UUID investigationId, String title, String category, String description, double confidenceScore) {
        return new InvestigationFinding(
                UUID.randomUUID(),
                investigationId,
                title,
                category,
                description,
                confidenceScore,
                Instant.now()
        );
    }
}
