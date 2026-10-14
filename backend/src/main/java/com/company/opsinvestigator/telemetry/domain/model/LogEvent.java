package com.company.opsinvestigator.telemetry.domain.model;

import java.time.Instant;
import java.util.UUID;

public record LogEvent(
        UUID id,
        String serviceName,
        String environment,
        Instant timestamp,
        String logLevel,
        String messageSample,
        String logStorageUrl,
        String queryRef,
        String traceId,
        String spanId
) {
    public static LogEvent of(String serviceName, String environment, Instant timestamp, String logLevel, String messageSample, String logStorageUrl, String queryRef, String traceId, String spanId) {
        return new LogEvent(UUID.randomUUID(), serviceName, environment, timestamp, logLevel, messageSample, logStorageUrl, queryRef, traceId, spanId);
    }
}
