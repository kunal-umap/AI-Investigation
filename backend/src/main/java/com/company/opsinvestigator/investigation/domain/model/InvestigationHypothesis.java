package com.company.opsinvestigator.investigation.domain.model;

import java.time.Instant;
import java.util.UUID;

public record InvestigationHypothesis(
        UUID id,
        UUID investigationId,
        String hypothesisText,
        String status,
        String evidenceReferences,
        Instant verifiedAt
) {
    public static InvestigationHypothesis propose(UUID investigationId, String text, String evidenceRefs) {
        return new InvestigationHypothesis(
                UUID.randomUUID(),
                investigationId,
                text,
                "PROPOSED",
                evidenceRefs,
                null
        );
    }
}
