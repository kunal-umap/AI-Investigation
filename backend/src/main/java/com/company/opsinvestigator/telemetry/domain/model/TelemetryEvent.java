package com.company.opsinvestigator.telemetry.domain.model;

import java.time.Instant;
import java.util.UUID;

public record TelemetryEvent(
        UUID id,
        UUID sourceId,
        String eventType,
        Instant timestamp,
        String serviceName,
        String environment,
        String payloadRef,
        String rawStorageRef,
        Instant createdAt
) {
    public static TelemetryEvent of(UUID sourceId, String eventType, Instant timestamp, String serviceName, String environment, String payloadRef, String rawStorageRef) {
        return new TelemetryEvent(UUID.randomUUID(), sourceId, eventType, timestamp, serviceName, environment, payloadRef, rawStorageRef, Instant.now());
    }
}
