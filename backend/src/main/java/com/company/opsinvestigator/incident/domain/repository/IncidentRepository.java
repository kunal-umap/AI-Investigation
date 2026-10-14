package com.company.opsinvestigator.incident.domain.repository;

import com.company.opsinvestigator.incident.domain.model.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Domain port for Incident persistence operations.
 * Pure interface free of framework dependencies.
 */
public interface IncidentRepository {

    Incident save(Incident incident);

    Optional<Incident> findById(UUID id);

    Optional<Incident> findByIncidentKey(String incidentKey);

    List<Incident> findAll(IncidentStatus status,
                           IncidentSeverity severity,
                           String serviceName,
                           String environment,
                           int page,
                           int size);

    long countAll(IncidentStatus status,
                  IncidentSeverity severity,
                  String serviceName,
                  String environment);

    IncidentTimelineEntry saveTimelineEntry(IncidentTimelineEntry entry);

    List<IncidentTimelineEntry> findTimelineEntries(UUID incidentId);

    List<IncidentEvidence> findEvidence(UUID incidentId);

    String nextIncidentKey();
}
