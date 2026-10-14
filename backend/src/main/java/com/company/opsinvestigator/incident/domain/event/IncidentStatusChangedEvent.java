package com.company.opsinvestigator.incident.domain.event;

import com.company.opsinvestigator.common.event.DomainEvent;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;

import java.time.Instant;
import java.util.UUID;

public record IncidentStatusChangedEvent(
        UUID eventId,
        UUID incidentId,
        String incidentKey,
        IncidentStatus previousStatus,
        IncidentStatus newStatus,
        String reason,
        long version,
        Instant occurredAt
) implements DomainEvent {

    public static IncidentStatusChangedEvent of(Incident incident, IncidentStatus previousStatus, String reason) {
        return new IncidentStatusChangedEvent(
                UUID.randomUUID(),
                incident.getId(),
                incident.getIncidentKey(),
                previousStatus,
                incident.getStatus(),
                reason,
                incident.getVersion(),
                Instant.now()
        );
    }

    @Override
    public String eventType() {
        return "ops.incident.updated";
    }

    @Override
    public String aggregateId() {
        return incidentId.toString();
    }
}
