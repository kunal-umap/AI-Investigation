package com.company.opsinvestigator.incident.api.dto;

import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;

import java.time.Instant;
import java.util.UUID;

public record IncidentResponse(
        UUID id,
        String incidentKey,
        String title,
        String description,
        IncidentStatus status,
        IncidentSeverity severity,
        String environment,
        String serviceName,
        Instant detectedAt,
        Instant startedAt,
        Instant resolvedAt,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {}
