package com.company.opsinvestigator.investigation.domain.model;

import java.util.Collections;
import java.util.List;

public record AiObservation(
        String id,
        String category, // METRIC, LOG, DEPLOYMENT, DATABASE, NETWORK
        String statement,
        double severityScore,
        List<String> evidenceReferences
) {
    public AiObservation {
        evidenceReferences = evidenceReferences == null ? Collections.emptyList() : List.copyOf(evidenceReferences);
    }
}
