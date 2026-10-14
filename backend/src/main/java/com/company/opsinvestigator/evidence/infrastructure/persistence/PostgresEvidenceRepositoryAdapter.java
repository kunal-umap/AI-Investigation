package com.company.opsinvestigator.evidence.infrastructure.persistence;

import com.company.opsinvestigator.evidence.domain.model.Evidence;
import com.company.opsinvestigator.evidence.domain.repository.EvidenceRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PostgresEvidenceRepositoryAdapter implements EvidenceRepository {

    private final SpringDataEvidenceRepository jpaRepository;

    public PostgresEvidenceRepositoryAdapter(SpringDataEvidenceRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Evidence save(Evidence evidence) {
        EvidenceJpaEntity entity = EvidenceJpaEntity.fromDomain(evidence);
        EvidenceJpaEntity saved = jpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Evidence> findById(UUID id) {
        return jpaRepository.findById(id).map(EvidenceJpaEntity::toDomain);
    }

    @Override
    public List<Evidence> findByTypeAndTimestampBetween(String type, Instant start, Instant end) {
        return jpaRepository.findByTypeAndTimestampBetweenOrderByTimestampDesc(type, start, end)
                .stream()
                .map(EvidenceJpaEntity::toDomain)
                .toList();
    }

    @Override
    public List<Evidence> findByReferenceId(String referenceId) {
        return jpaRepository.findByReferenceId(referenceId)
                .stream()
                .map(EvidenceJpaEntity::toDomain)
                .toList();
    }
}
