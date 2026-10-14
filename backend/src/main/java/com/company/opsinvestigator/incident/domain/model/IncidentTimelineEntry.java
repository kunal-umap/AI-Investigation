package com.company.opsinvestigator.incident.domain.model;

import java.time.Instant;
import java.util.UUID;

public record IncidentTimelineEntry(
        UUID id,
        UUID incidentId,
        Instant timestamp,
        String entryType,
        String summary,
        String description,
        String sourceRef,
        Instant createdAt
) {
    public static IncidentTimelineEntry create(UUID incidentId, Instant timestamp, String entryType, String summary, String description, String sourceRef) {
        return new IncidentTimelineEntry(
                UUID.randomUUID(),
                incidentId,
                timestamp != null ? timestamp : Instant.now(),
                entryType,
                summary,
                description,
                sourceRef,
                Instant.now()
        );
    }
}
