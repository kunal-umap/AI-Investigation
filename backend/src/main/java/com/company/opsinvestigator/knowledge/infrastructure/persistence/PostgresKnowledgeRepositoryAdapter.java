package com.company.opsinvestigator.knowledge.infrastructure.persistence;

import com.company.opsinvestigator.knowledge.domain.model.HistoricalIncident;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeDocument;
import com.company.opsinvestigator.knowledge.domain.model.Postmortem;
import com.company.opsinvestigator.knowledge.domain.model.Runbook;
import com.company.opsinvestigator.knowledge.domain.repository.KnowledgeRepository;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class PostgresKnowledgeRepositoryAdapter implements KnowledgeRepository {

    private final ConcurrentHashMap<String, List<Runbook>> runbookStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, List<HistoricalIncident>> historyStore = new ConcurrentHashMap<>();

    @Override
    public List<Runbook> findRunbooksByService(String serviceName) {
        return runbookStore.getOrDefault(serviceName, Collections.emptyList());
    }

    @Override
    public List<HistoricalIncident> findHistoricalIncidentsByService(String serviceName) {
        return historyStore.getOrDefault(serviceName, Collections.emptyList());
    }

    @Override
    public Runbook saveRunbook(Runbook runbook) {
        runbookStore.computeIfAbsent(runbook.serviceName(), k -> new java.util.concurrent.CopyOnWriteArrayList<>()).add(runbook);
        return runbook;
    }

    @Override
    public HistoricalIncident saveHistoricalIncident(HistoricalIncident incident) {
        historyStore.computeIfAbsent(incident.serviceName(), k -> new java.util.concurrent.CopyOnWriteArrayList<>()).add(incident);
        return incident;
    }

    @Override
    public Optional<Postmortem> findPostmortemByIncidentId(UUID incidentId) {
        return Optional.empty();
    }

    @Override
    public List<KnowledgeDocument> searchKnowledge(String query) {
        return Collections.emptyList();
    }
}
