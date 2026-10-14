package com.company.opsinvestigator.investigation.domain.model;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Domain model for an AI-generated or human-verified hypothesis.
 * CRITICAL SAFETY: The AI model may only assign UNCONFIRMED, LIKELY, or REJECTED.
 * Only a human engineer can promote a hypothesis to CONFIRMED_BY_HUMAN.
 */
public record AiHypothesis(
        String id,
        String statement,
        double confidence,
        List<String> supportingEvidenceIds,
        List<String> contradictingEvidenceIds,
        HypothesisStatus status
) {
    public AiHypothesis {
        Objects.requireNonNull(id, "Hypothesis id must not be null");
        Objects.requireNonNull(statement, "Statement must not be null");
        Objects.requireNonNull(status, "Status must not be null");
        supportingEvidenceIds = supportingEvidenceIds == null ? Collections.emptyList() : List.copyOf(supportingEvidenceIds);
        contradictingEvidenceIds = contradictingEvidenceIds == null ? Collections.emptyList() : List.copyOf(contradictingEvidenceIds);
    }

    public AiHypothesis withConfirmedByHuman() {
        return new AiHypothesis(
                this.id,
                this.statement,
                1.0,
                this.supportingEvidenceIds,
                this.contradictingEvidenceIds,
                HypothesisStatus.CONFIRMED_BY_HUMAN
        );
    }
}
