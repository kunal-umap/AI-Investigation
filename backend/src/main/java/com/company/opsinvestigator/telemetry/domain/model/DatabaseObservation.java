package com.company.opsinvestigator.telemetry.domain.model;

import java.time.Instant;
import java.util.UUID;

public record DatabaseObservation(
        UUID id,
        String dbInstanceId,
        String serviceName,
        Instant timestamp,
        String querySample,
        long executionTimeMs,
        int deadlocksDetected,
        double connectionPoolUsagePct,
        String rawRef
) {
    public static DatabaseObservation of(String dbInstanceId, String serviceName, Instant timestamp, String querySample, long executionTimeMs, int deadlocks, double poolUsage, String rawRef) {
        return new DatabaseObservation(UUID.randomUUID(), dbInstanceId, serviceName, timestamp, querySample, executionTimeMs, deadlocks, poolUsage, rawRef);
    }
}
