package com.company.opsinvestigator.telemetry.domain.model;

import java.time.Instant;
import java.util.UUID;

public record MetricSnapshot(
        UUID id,
        String metricName,
        String serviceName,
        String environment,
        Instant timestamp,
        double value,
        String unit,
        String labels,
        Double anomalyScore
) {
    public static MetricSnapshot of(String metricName, String serviceName, String environment, Instant timestamp, double value, String unit, String labels, Double anomalyScore) {
        return new MetricSnapshot(UUID.randomUUID(), metricName, serviceName, environment, timestamp, value, unit, labels, anomalyScore);
    }
}
