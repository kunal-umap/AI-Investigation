package com.company.opsinvestigator.investigation.evaluation;

public record EvaluationResult(
        int totalScenariosEvaluated,
        double evidenceRetrievalPrecision,
        double historicalIncidentRetrievalQuality,
        double hypothesisCorrectness,
        double unsupportedClaimRate, // Must be 0.0 or near 0.0 due to strict EvidenceValidator
        double evidenceCitationAccuracy,
        double averageLatencyMs
) {}
