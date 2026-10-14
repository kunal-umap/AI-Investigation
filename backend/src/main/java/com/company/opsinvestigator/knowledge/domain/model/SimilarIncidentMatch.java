package com.company.opsinvestigator.knowledge.domain.model;

import java.util.Collections;
import java.util.List;

public record SimilarIncidentMatch(
        String incidentId,
        String incidentKey,
        String title,
        double similarityScore,
        List<String> matchingSignals,
        String historicalRootCause,
        String historicalResolution,
        String originalIncidentReference,
        boolean isSameIncident
) {
    public SimilarIncidentMatch {
        matchingSignals = matchingSignals == null ? Collections.emptyList() : List.copyOf(matchingSignals);
    }
}
