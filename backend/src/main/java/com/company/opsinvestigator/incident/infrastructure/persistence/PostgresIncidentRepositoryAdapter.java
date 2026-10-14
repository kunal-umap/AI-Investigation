package com.company.opsinvestigator.incident.infrastructure.persistence;

import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentEvidence;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.company.opsinvestigator.incident.domain.model.IncidentTimelineEntry;
import com.company.opsinvestigator.incident.domain.repository.IncidentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class PostgresIncidentRepositoryAdapter implements IncidentRepository {

    private final SpringDataIncidentRepository incidentJpaRepository;
    private final SpringDataIncidentTimelineRepository timelineJpaRepository;
    private final SpringDataIncidentEvidenceRepository evidenceJpaRepository;
    private final AtomicLong sequenceGenerator = new AtomicLong(System.currentTimeMillis() % 10000);

    public PostgresIncidentRepositoryAdapter(
            SpringDataIncidentRepository incidentJpaRepository,
            SpringDataIncidentTimelineRepository timelineJpaRepository,
            SpringDataIncidentEvidenceRepository evidenceJpaRepository) {
        this.incidentJpaRepository = incidentJpaRepository;
        this.timelineJpaRepository = timelineJpaRepository;
        this.evidenceJpaRepository = evidenceJpaRepository;
    }

    @Override
    public Incident save(Incident incident) {
        IncidentJpaEntity entity = IncidentJpaEntity.fromDomain(incident);
        IncidentJpaEntity saved = incidentJpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Incident> findById(UUID id) {
        return incidentJpaRepository.findById(id).map(IncidentJpaEntity::toDomain);
    }

    @Override
    public Optional<Incident> findByIncidentKey(String incidentKey) {
        return incidentJpaRepository.findByIncidentKey(incidentKey).map(IncidentJpaEntity::toDomain);
    }

    @Override
    public List<Incident> findAll(IncidentStatus status,
                                  IncidentSeverity severity,
                                  String serviceName,
                                  String environment,
                                  int page,
                                  int size) {
        return incidentJpaRepository.findFiltered(status, severity, serviceName, environment, PageRequest.of(page, size))
                .map(IncidentJpaEntity::toDomain)
                .getContent();
    }

    @Override
    public long countAll(IncidentStatus status,
                         IncidentSeverity severity,
                         String serviceName,
                         String environment) {
        return incidentJpaRepository.countFiltered(status, severity, serviceName, environment);
    }

    @Override
    public IncidentTimelineEntry saveTimelineEntry(IncidentTimelineEntry entry) {
        IncidentTimelineJpaEntity entity = IncidentTimelineJpaEntity.fromDomain(entry);
        IncidentTimelineJpaEntity saved = timelineJpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public List<IncidentTimelineEntry> findTimelineEntries(UUID incidentId) {
        return timelineJpaRepository.findByIncidentIdOrderByTimestampAsc(incidentId)
                .stream()
                .map(IncidentTimelineJpaEntity::toDomain)
                .toList();
    }

    @Override
    public List<IncidentEvidence> findEvidence(UUID incidentId) {
        return evidenceJpaRepository.findByIncidentIdOrderByRelevanceScoreDesc(incidentId)
                .stream()
                .map(IncidentEvidenceJpaEntity::toDomain)
                .toList();
    }

    @Override
    public String nextIncidentKey() {
        int currentYear = Year.now().getValue();
        long seq = sequenceGenerator.incrementAndGet();
        return String.format("INC-%d-%04d", currentYear, seq);
    }
}
