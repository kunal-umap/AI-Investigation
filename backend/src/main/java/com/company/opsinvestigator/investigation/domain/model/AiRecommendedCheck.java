package com.company.opsinvestigator.investigation.domain.model;

import java.util.Collections;
import java.util.List;

public record AiRecommendedCheck(
        String id,
        String title,
        String description,
        String rationale,
        boolean isHumanOnlyGuardrailEnforced,
        List<String> suggestedDiagnostics
) {
    public AiRecommendedCheck {
        suggestedDiagnostics = suggestedDiagnostics == null ? Collections.emptyList() : List.copyOf(suggestedDiagnostics);
    }
}
