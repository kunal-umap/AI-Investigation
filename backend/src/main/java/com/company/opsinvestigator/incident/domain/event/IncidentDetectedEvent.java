package com.company.opsinvestigator.incident.domain.event;

import com.company.opsinvestigator.common.event.DomainEvent;
import com.company.opsinvestigator.incident.domain.model.Incident;

import java.time.Instant;
import java.util.UUID;

public record IncidentDetectedEvent(
        UUID eventId,
        UUID incidentId,
        String incidentKey,
        String serviceName,
        String environment,
        String severity,
        Instant occurredAt
) implements DomainEvent {

    public static IncidentDetectedEvent from(Incident incident) {
        return new IncidentDetectedEvent(
                UUID.randomUUID(),
                incident.getId(),
                incident.getIncidentKey(),
                incident.getServiceName(),
                incident.getEnvironment(),
                incident.getSeverity().name(),
                incident.getCreatedAt()
        );
    }

    @Override
    public String eventType() {
        return "ops.incident.detected";
    }

    @Override
    public String aggregateId() {
        return incidentId.toString();
    }
}
