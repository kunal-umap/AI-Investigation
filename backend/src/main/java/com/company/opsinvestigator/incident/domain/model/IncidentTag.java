package com.company.opsinvestigator.incident.domain.model;

import java.util.UUID;

public record IncidentTag(
        UUID id,
        UUID incidentId,
        String tagKey,
        String tagValue
) {
    public static IncidentTag of(UUID incidentId, String tagKey, String tagValue) {
        return new IncidentTag(UUID.randomUUID(), incidentId, tagKey, tagValue);
    }
}
