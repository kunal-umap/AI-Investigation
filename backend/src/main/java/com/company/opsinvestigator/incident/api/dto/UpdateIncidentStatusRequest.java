package com.company.opsinvestigator.incident.api.dto;

import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateIncidentStatusRequest(
        @NotNull(message = "Status is required (DETECTED, INVESTIGATING, MITIGATED, RESOLVED, CLOSED)")
        IncidentStatus status,

        @Size(max = 500, message = "Reason must not exceed 500 characters")
        String reason,

        @NotNull(message = "Expected version is required for optimistic locking")
        Long expectedVersion
) {}
