package com.company.opsinvestigator.incident.api.dto;

import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateIncidentRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Severity is required (LOW, MEDIUM, HIGH, CRITICAL)")
        IncidentSeverity severity,

        @NotBlank(message = "Environment is required (e.g. production, staging)")
        @Size(max = 64, message = "Environment must not exceed 64 characters")
        String environment,

        @NotBlank(message = "ServiceName is required (e.g. order-service)")
        @Size(max = 128, message = "ServiceName must not exceed 128 characters")
        String serviceName,

        Instant startedAt
) {}
