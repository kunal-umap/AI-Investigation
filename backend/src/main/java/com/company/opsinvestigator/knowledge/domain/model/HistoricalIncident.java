package com.company.opsinvestigator.knowledge.domain.model;

import java.time.Instant;
import java.util.UUID;

public record HistoricalIncident(
        UUID id,
        String originalIncidentKey,
        String serviceName,
        String rootCauseSummary,
        String resolutionSummary,
        Instant resolvedAt,
        int recurrenceCount
) {
    public static HistoricalIncident of(String key, String service, String rootCause, String resolution, Instant resolvedAt, int count) {
        return new HistoricalIncident(UUID.randomUUID(), key, service, rootCause, resolution, resolvedAt, count);
    }
}
