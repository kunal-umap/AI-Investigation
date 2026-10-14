package com.company.opsinvestigator.telemetry.domain.model;

import java.time.Instant;
import java.util.UUID;

public record ServerObservation(
        UUID id,
        String hostOrPodName,
        String serviceName,
        String environment,
        Instant timestamp,
        double cpuUsagePct,
        double memoryUsagePct,
        double diskUsagePct,
        String status
) {
    public static ServerObservation of(String hostOrPod, String service, String env, Instant time, double cpu, double mem, double disk, String status) {
        return new ServerObservation(UUID.randomUUID(), hostOrPod, service, env, time, cpu, mem, disk, status);
    }
}
