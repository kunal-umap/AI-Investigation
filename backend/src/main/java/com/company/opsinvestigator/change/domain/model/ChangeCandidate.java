package com.company.opsinvestigator.change.domain.model;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

public record ChangeCandidate(
        String changeId,
        String type, // DEPLOYMENT, GIT_COMMIT, CONFIG_CHANGE, DB_MIGRATION
        String service,
        String component,
        Instant timestamp,
        String description,
        List<String> relatedFiles,
        List<String> relatedDatabaseObjects,
        double temporalProximityMinutes,
        String relationshipToSymptoms // Non-assertive summary of temporal proximity
) {
    public ChangeCandidate {
        relatedFiles = relatedFiles == null ? Collections.emptyList() : List.copyOf(relatedFiles);
        relatedDatabaseObjects = relatedDatabaseObjects == null ? Collections.emptyList() : List.copyOf(relatedDatabaseObjects);
    }
}
