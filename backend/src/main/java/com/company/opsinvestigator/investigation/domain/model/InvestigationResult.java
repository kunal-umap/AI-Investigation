package com.company.opsinvestigator.investigation.domain.model;

import java.util.Collections;
import java.util.List;

/**
 * Raw structured model output before domain evidence validation.
 */
public record InvestigationResult(
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
        List<String> evidenceReferences
) {
    public InvestigationResult {
        observations = observations == null ? Collections.emptyList() : List.copyOf(observations);
        hypotheses = hypotheses == null ? Collections.emptyList() : List.copyOf(hypotheses);
        similarIncidents = similarIncidents == null ? Collections.emptyList() : List.copyOf(similarIncidents);
        recentChanges = recentChanges == null ? Collections.emptyList() : List.copyOf(recentChanges);
        recommendedChecks = recommendedChecks == null ? Collections.emptyList() : List.copyOf(recommendedChecks);
        unknowns = unknowns == null ? Collections.emptyList() : List.copyOf(unknowns);
        evidenceReferences = evidenceReferences == null ? Collections.emptyList() : List.copyOf(evidenceReferences);
    }
}
