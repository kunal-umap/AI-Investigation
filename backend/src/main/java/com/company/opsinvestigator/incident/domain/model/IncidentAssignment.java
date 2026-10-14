package com.company.opsinvestigator.incident.domain.model;

import java.time.Instant;
import java.util.UUID;

public record IncidentAssignment(
        UUID id,
        UUID incidentId,
        String assigneeId,
        String assigneeName,
        String role,
        Instant assignedAt
) {
    public static IncidentAssignment assign(UUID incidentId, String assigneeId, String assigneeName, String role) {
        return new IncidentAssignment(UUID.randomUUID(), incidentId, assigneeId, assigneeName, role, Instant.now());
    }
}
