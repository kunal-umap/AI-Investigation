package com.company.opsinvestigator.investigation.domain.model;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

public record AiRecentChange(
        String changeId,
        String type, // DEPLOYMENT, GIT_COMMIT, CONFIG_CHANGE, DB_MIGRATION
        String description,
        Instant timestamp,
        String service,
        String component,
        double temporalProximityMinutes,
        String potentialRelationship, // Non-assertive: e.g. "Potential relationship between deployment X and symptom Y without asserting causality"
        List<String> evidenceReferences
) {
    public AiRecentChange {
        evidenceReferences = evidenceReferences == null ? Collections.emptyList() : List.copyOf(evidenceReferences);
    }
}
