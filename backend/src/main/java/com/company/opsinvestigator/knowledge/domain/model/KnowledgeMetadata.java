package com.company.opsinvestigator.knowledge.domain.model;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record KnowledgeMetadata(
        String documentId,
        String type, // HISTORICAL_INCIDENT, POSTMORTEM, RUNBOOK, SOP, ARCHITECTURE, TROUBLESHOOTING
        String service,
        String component,
        String environment,
        Instant createdAt,
        List<String> tags,
        UUID incidentId,
        String version,
        String minimumRequiredRole // Security authorization filtering
) {
    public KnowledgeMetadata {
        tags = tags == null ? Collections.emptyList() : List.copyOf(tags);
    }
}
