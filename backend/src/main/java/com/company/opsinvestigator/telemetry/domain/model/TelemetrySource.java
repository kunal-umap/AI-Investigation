package com.company.opsinvestigator.telemetry.domain.model;

import java.time.Instant;
import java.util.UUID;

public record TelemetrySource(
        UUID id,
        String sourceName,
        String sourceType,
        String status,
        String configRef,
        Instant createdAt
) {
    public static TelemetrySource create(String name, String type, String configRef) {
        return new TelemetrySource(UUID.randomUUID(), name, type, "ACTIVE", configRef, Instant.now());
    }
}
