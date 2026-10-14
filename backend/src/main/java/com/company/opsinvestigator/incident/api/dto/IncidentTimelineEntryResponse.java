package com.company.opsinvestigator.incident.api.dto;

import java.time.Instant;
import java.util.UUID;

public record IncidentTimelineEntryResponse(
        UUID id,
        UUID incidentId,
        Instant timestamp,
        String entryType,
        String summary,
        String description,
        String sourceRef,
        Instant createdAt
) {}
