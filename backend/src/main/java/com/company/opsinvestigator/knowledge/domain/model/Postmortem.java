package com.company.opsinvestigator.knowledge.domain.model;

import java.time.Instant;
import java.util.UUID;

public record Postmortem(
        UUID id,
        UUID incidentId,
        String title,
        String owner,
        String timelineSummary,
        String rootCause,
        String correctiveActionsSummary,
        String documentUrl,
        Instant publishedAt
) {
    public static Postmortem create(UUID incidentId, String title, String owner, String timeline, String rootCause, String actions, String docUrl) {
        return new Postmortem(UUID.randomUUID(), incidentId, title, owner, timeline, rootCause, actions, docUrl, Instant.now());
    }
}
