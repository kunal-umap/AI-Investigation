package com.company.opsinvestigator.investigation.domain.model;

import com.company.opsinvestigator.evidence.domain.model.Evidence;
import com.company.opsinvestigator.incident.domain.model.Incident;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public record InvestigationContext(
        Incident incident,
        List<Evidence> selectedEvidence,
        List<String> knowledgeSnippets,
        List<AiRecentChange> candidateChanges,
        String requestingUserId,
        String requestingUserRole
) {
    public InvestigationContext {
        selectedEvidence = selectedEvidence == null ? Collections.emptyList() : List.copyOf(selectedEvidence);
        knowledgeSnippets = knowledgeSnippets == null ? Collections.emptyList() : List.copyOf(knowledgeSnippets);
        candidateChanges = candidateChanges == null ? Collections.emptyList() : List.copyOf(candidateChanges);
    }

    public Set<String> getValidEvidenceIds() {
        return selectedEvidence.stream()
                .map(Evidence::getReferenceId)
                .collect(Collectors.toSet());
    }
}
