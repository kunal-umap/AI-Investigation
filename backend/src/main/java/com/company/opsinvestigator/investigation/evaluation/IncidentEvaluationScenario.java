package com.company.opsinvestigator.investigation.evaluation;

import java.util.List;

/**
 * Single evaluation scenario for AI Investigation benchmark.
 */
public record IncidentEvaluationScenario(
        String scenarioId,
        String title,
        String service,
        String telemetrySummary,
        String knownRootCause,
        List<String> relevantEvidenceIds,
        List<String> irrelevantEvidenceIds,
        String expectedSimilarIncidentId,
        String recentChangeSummary
) {}
