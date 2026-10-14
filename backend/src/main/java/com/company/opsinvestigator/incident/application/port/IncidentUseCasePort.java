package com.company.opsinvestigator.incident.application.port;

import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentEvidence;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.company.opsinvestigator.incident.domain.model.IncidentTimelineEntry;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface IncidentUseCasePort {

    Incident createIncident(String title,
                            String description,
                            IncidentSeverity severity,
                            String environment,
                            String serviceName,
                            Instant startedAt);

    Incident getIncidentById(UUID id);

    Incident updateStatus(UUID id, IncidentStatus newStatus, String reason, long expectedVersion);

    List<Incident> listIncidents(IncidentStatus status,
                                 IncidentSeverity severity,
                                 String serviceName,
                                 String environment,
                                 int page,
                                 int size);

    long countIncidents(IncidentStatus status,
                        IncidentSeverity severity,
                        String serviceName,
                        String environment);

    List<IncidentTimelineEntry> getTimeline(UUID incidentId);

    List<IncidentEvidence> getEvidence(UUID incidentId);
}
