package com.company.opsinvestigator.investigation.domain.model;

import java.util.Collections;
import java.util.List;

public record AiSimilarIncident(
        String incidentId,
        String incidentKey,
        String title,
        double similarityScore,
        List<String> matchingSignals,
        String historicalRootCause,
        String historicalResolution,
        String originalIncidentReference,
        boolean isSameIncident // AI must explicitly distinguish 'similar historical incident' from 'same incident'
) {
    public AiSimilarIncident {
        matchingSignals = matchingSignals == null ? Collections.emptyList() : List.copyOf(matchingSignals);
    }
}
