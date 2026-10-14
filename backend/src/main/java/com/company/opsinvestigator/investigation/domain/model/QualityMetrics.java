package com.company.opsinvestigator.investigation.domain.model;

import java.time.Instant;

public record QualityMetrics(
        String model,
        String modelVersion,
        String promptVersion,
        Instant createdAt,
        int inputEvidenceCount,
        int knowledgeSourcesUsed,
        int recentChangesEvaluated,
        double outputConfidence,
        long executionDurationMs,
        boolean circuitBreakerTripped,
        boolean schemaFallbackUsed
) {}
