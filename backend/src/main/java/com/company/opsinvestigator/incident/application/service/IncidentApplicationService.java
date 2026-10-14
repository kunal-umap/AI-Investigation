package com.company.opsinvestigator.incident.application.service;

import com.company.opsinvestigator.common.event.EventPublisher;
import com.company.opsinvestigator.common.exception.ResourceNotFoundException;
import com.company.opsinvestigator.incident.application.port.IncidentUseCasePort;
import com.company.opsinvestigator.incident.domain.event.IncidentDetectedEvent;
import com.company.opsinvestigator.incident.domain.event.IncidentStatusChangedEvent;
import com.company.opsinvestigator.incident.domain.model.*;
import com.company.opsinvestigator.incident.domain.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class IncidentApplicationService implements IncidentUseCasePort {

    private static final Logger log = LoggerFactory.getLogger(IncidentApplicationService.class);

    private final IncidentRepository incidentRepository;
    private final EventPublisher eventPublisher;

    public IncidentApplicationService(IncidentRepository incidentRepository, EventPublisher eventPublisher) {
        this.incidentRepository = incidentRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public Incident createIncident(String title,
                                   String description,
                                   IncidentSeverity severity,
                                   String environment,
                                   String serviceName,
                                   Instant startedAt) {
        String incidentKey = incidentRepository.nextIncidentKey();
        Incident incident = Incident.createNew(
                incidentKey,
                title,
                description,
                severity,
                environment,
                serviceName,
                startedAt
        );

        Incident saved = incidentRepository.save(incident);
        log.info("Created incident [id={}] [key={}] [service={}] [severity={}]",
                saved.getId(), saved.getIncidentKey(), saved.getServiceName(), saved.getSeverity());

        // Create initial timeline entry
        incidentRepository.saveTimelineEntry(IncidentTimelineEntry.create(
                saved.getId(),
                saved.getDetectedAt(),
                "INCIDENT_DETECTED",
                "Incident detected in " + environment + " for " + serviceName,
                description,
                "SYSTEM_TELEMETRY"
        ));

        // Publish ops.incident.detected event
        eventPublisher.publish("ops.incident.detected", IncidentDetectedEvent.from(saved));

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Incident getIncidentById(UUID id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with ID: " + id));
    }

    @Override
    public Incident updateStatus(UUID id, IncidentStatus newStatus, String reason, long expectedVersion) {
        Incident incident = getIncidentById(id);
        IncidentStatus previousStatus = incident.getStatus();

        incident.updateStatus(newStatus, expectedVersion);
        Incident updated = incidentRepository.save(incident);

        log.info("Updated incident status [id={}] [key={}] [from={}] [to={}]",
                updated.getId(), updated.getIncidentKey(), previousStatus, newStatus);

        // Record status change in timeline
        incidentRepository.saveTimelineEntry(IncidentTimelineEntry.create(
                updated.getId(),
                Instant.now(),
                "STATUS_CHANGE",
                String.format("Status changed from %s to %s", previousStatus, newStatus),
                reason != null ? reason : "Status updated by operator",
                "HUMAN_OPERATOR"
        ));

        // Publish ops.incident.updated event
        eventPublisher.publish("ops.incident.updated", IncidentStatusChangedEvent.of(updated, previousStatus, reason));

        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incident> listIncidents(IncidentStatus status,
                                        IncidentSeverity severity,
                                        String serviceName,
                                        String environment,
                                        int page,
                                        int size) {
        return incidentRepository.findAll(status, severity, serviceName, environment, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long countIncidents(IncidentStatus status,
                               IncidentSeverity severity,
                               String serviceName,
                               String environment) {
        return incidentRepository.countAll(status, severity, serviceName, environment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentTimelineEntry> getTimeline(UUID incidentId) {
        // Verify incident exists first
        getIncidentById(incidentId);
        return incidentRepository.findTimelineEntries(incidentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentEvidence> getEvidence(UUID incidentId) {
        // Verify incident exists first
        getIncidentById(incidentId);
        return incidentRepository.findEvidence(incidentId);
    }
}
