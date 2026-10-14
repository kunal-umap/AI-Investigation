package com.company.opsinvestigator.incident.domain.model;

import java.time.Instant;
import java.util.UUID;

public record IncidentEvidence(
        UUID id,
        UUID incidentId,
        UUID evidenceId,
        String relationType,
        double relevanceScore,
        String notes,
        Instant linkedAt
) {
    public static IncidentEvidence link(UUID incidentId, UUID evidenceId, String relationType, double relevanceScore, String notes) {
        return new IncidentEvidence(
                UUID.randomUUID(),
                incidentId,
                evidenceId,
                relationType,
                relevanceScore,
                notes,
                Instant.now()
        );
    }
}
