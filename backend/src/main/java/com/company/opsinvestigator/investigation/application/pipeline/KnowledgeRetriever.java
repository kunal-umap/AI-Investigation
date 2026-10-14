package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.knowledge.application.port.KnowledgeSearchPort;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeSearchResult;
import com.company.opsinvestigator.incident.domain.model.Incident;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Retrieves historical postmortems, runbooks, and SOPs with authorization filtering.
 */
public class KnowledgeRetriever {

    private final KnowledgeSearchPort knowledgeSearchPort;

    public KnowledgeRetriever(KnowledgeSearchPort knowledgeSearchPort) {
        this.knowledgeSearchPort = knowledgeSearchPort;
    }

    public List<String> retrieveKnowledgeSnippets(Incident incident, String userRole, int limit) {
        String query = incident.getService() + " " + incident.getTitle();
        Map<String, Object> filters = new HashMap<>();
        filters.put("service", incident.getService());

        List<KnowledgeSearchResult> results = knowledgeSearchPort.search(query, filters, userRole, limit);
        return results.stream()
                .map(r -> "[" + r.metadata().type() + "] " + r.metadata().documentId() + " (" + String.format("%.2f", r.score()) + "): " + r.text())
                .collect(Collectors.toList());
    }
}
