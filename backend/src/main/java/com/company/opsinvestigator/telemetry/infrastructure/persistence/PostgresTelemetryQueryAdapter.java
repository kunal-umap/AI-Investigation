package com.company.opsinvestigator.telemetry.infrastructure.persistence;

import com.company.opsinvestigator.telemetry.application.port.TelemetryQueryPort;
import com.company.opsinvestigator.telemetry.domain.model.DatabaseObservation;
import com.company.opsinvestigator.telemetry.domain.model.LogEvent;
import com.company.opsinvestigator.telemetry.domain.model.MetricSnapshot;
import com.company.opsinvestigator.telemetry.domain.model.ServerObservation;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Component
public class PostgresTelemetryQueryAdapter implements TelemetryQueryPort {

    @Override
    public List<MetricSnapshot> findMetricsAroundWindow(String serviceName, String environment, Instant start, Instant end) {
        // Returns metric anomaly snapshots within the temporal incident window
        return Collections.emptyList();
    }

    @Override
    public List<LogEvent> findLogEventsAroundWindow(String serviceName, String environment, Instant start, Instant end, String minLevel) {
        // Queries external log storage pointers for the window
        return Collections.emptyList();
    }

    @Override
    public List<DatabaseObservation> findDatabaseObservations(String serviceName, Instant start, Instant end) {
        return Collections.emptyList();
    }

    @Override
    public List<ServerObservation> findServerObservations(String serviceName, String environment, Instant start, Instant end) {
        return Collections.emptyList();
    }
}
