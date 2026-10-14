package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.evidence.domain.model.Evidence;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.investigation.domain.model.AiRecentChange;
import com.company.opsinvestigator.investigation.domain.model.InvestigationContext;

import java.time.Duration;
import java.util.List;

/**
 * Builds the complete multi-source InvestigationContext.
 */
public class IncidentContextBuilder {

    private final EvidenceSelector evidenceSelector;
    private final KnowledgeRetriever knowledgeRetriever;
    private final ChangeRetriever changeRetriever;

    public IncidentContextBuilder(EvidenceSelector evidenceSelector,
                                  KnowledgeRetriever knowledgeRetriever,
                                  ChangeRetriever changeRetriever) {
        this.evidenceSelector = evidenceSelector;
        this.knowledgeRetriever = knowledgeRetriever;
        this.changeRetriever = changeRetriever;
    }

    public InvestigationContext buildContext(Incident incident, String requestingUserId, String requestingUserRole) {
        List<Evidence> evidence = evidenceSelector.selectEvidenceForIncident(incident, 25);
        List<String> knowledgeSnippets = knowledgeRetriever.retrieveKnowledgeSnippets(incident, requestingUserRole, 5);
        List<AiRecentChange> changes = changeRetriever.retrieveCandidateChanges(incident, Duration.ofHours(24));

        return new InvestigationContext(
                incident,
                evidence,
                knowledgeSnippets,
                changes,
                requestingUserId,
                requestingUserRole
        );
    }
}
