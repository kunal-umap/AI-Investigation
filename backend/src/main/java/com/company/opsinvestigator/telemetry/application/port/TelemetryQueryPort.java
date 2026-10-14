package com.company.opsinvestigator.telemetry.application.port;

import com.company.opsinvestigator.telemetry.domain.model.DatabaseObservation;
import com.company.opsinvestigator.telemetry.domain.model.LogEvent;
import com.company.opsinvestigator.telemetry.domain.model.MetricSnapshot;
import com.company.opsinvestigator.telemetry.domain.model.ServerObservation;

import java.time.Instant;
import java.util.List;

public interface TelemetryQueryPort {
    List<MetricSnapshot> findMetricsAroundWindow(String serviceName, String environment, Instant start, Instant end);
    List<LogEvent> findLogEventsAroundWindow(String serviceName, String environment, Instant start, Instant end, String minLevel);
    List<DatabaseObservation> findDatabaseObservations(String serviceName, Instant start, Instant end);
    List<ServerObservation> findServerObservations(String serviceName, String environment, Instant start, Instant end);
}
