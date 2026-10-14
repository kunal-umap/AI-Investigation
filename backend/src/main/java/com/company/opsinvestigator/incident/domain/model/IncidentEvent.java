package com.company.opsinvestigator.incident.domain.model;

import java.time.Instant;
import java.util.UUID;

public record IncidentEvent(
        UUID id,
        UUID incidentId,
        String eventType,
        Instant timestamp,
        String summary,
        String details,
        String actor,
        Instant createdAt
) {
    public static IncidentEvent create(UUID incidentId, String eventType, String summary, String details, String actor) {
        Instant now = Instant.now();
        return new IncidentEvent(
                UUID.randomUUID(),
                incidentId,
                eventType,
                now,
                summary,
                details,
                actor,
                now
        );
    }
}
