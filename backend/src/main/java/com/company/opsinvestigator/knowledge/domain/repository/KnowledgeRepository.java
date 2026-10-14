package com.company.opsinvestigator.knowledge.domain.repository;

import com.company.opsinvestigator.knowledge.domain.model.HistoricalIncident;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeDocument;
import com.company.opsinvestigator.knowledge.domain.model.Postmortem;
import com.company.opsinvestigator.knowledge.domain.model.Runbook;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KnowledgeRepository {
    List<Runbook> findRunbooksByService(String serviceName);
    List<HistoricalIncident> findHistoricalIncidentsByService(String serviceName);
    Runbook saveRunbook(Runbook runbook);
    HistoricalIncident saveHistoricalIncident(HistoricalIncident incident);
    Optional<Postmortem> findPostmortemByIncidentId(UUID incidentId);
    List<KnowledgeDocument> searchKnowledge(String query);
}
