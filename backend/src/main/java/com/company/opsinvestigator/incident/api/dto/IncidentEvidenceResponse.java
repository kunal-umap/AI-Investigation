package com.company.opsinvestigator.incident.api.dto;

import java.time.Instant;
import java.util.UUID;

public record IncidentEvidenceResponse(
        UUID id,
        UUID incidentId,
        UUID evidenceId,
        String relationType,
        double relevanceScore,
        String notes,
        Instant linkedAt
) {}
