package com.company.opsinvestigator.investigation.domain.model;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Validated Investigation Report produced after the evidence validation pipeline step.
 */
public record InvestigationReport(
        UUID id,
        UUID incidentId,
        String summary,
        String impact,
        String timeline,
        List<AiObservation> observations,
        List<AiHypothesis> hypotheses,
        List<AiSimilarIncident> similarIncidents,
        List<AiRecentChange> recentChanges,
        List<AiRecommendedCheck> recommendedChecks,
        List<String> unknowns,
        double confidence,
        List<String> validatedEvidenceReferences,
        List<String> rejectedInvalidEvidenceIds,
        QualityMetrics metrics,
        Instant generatedAt
) {
    public InvestigationReport {
        observations = observations == null ? Collections.emptyList() : List.copyOf(observations);
        hypotheses = hypotheses == null ? Collections.emptyList() : List.copyOf(hypotheses);
        similarIncidents = similarIncidents == null ? Collections.emptyList() : List.copyOf(similarIncidents);
        recentChanges = recentChanges == null ? Collections.emptyList() : List.copyOf(recentChanges);
        recommendedChecks = recommendedChecks == null ? Collections.emptyList() : List.copyOf(recommendedChecks);
        unknowns = unknowns == null ? Collections.emptyList() : List.copyOf(unknowns);
        validatedEvidenceReferences = validatedEvidenceReferences == null ? Collections.emptyList() : List.copyOf(validatedEvidenceReferences);
        rejectedInvalidEvidenceIds = rejectedInvalidEvidenceIds == null ? Collections.emptyList() : List.copyOf(rejectedInvalidEvidenceIds);
    }
}
