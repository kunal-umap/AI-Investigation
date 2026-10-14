package com.company.opsinvestigator.evidence.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SpringDataEvidenceRepository extends JpaRepository<EvidenceJpaEntity, UUID> {
    List<EvidenceJpaEntity> findByTypeAndTimestampBetweenOrderByTimestampDesc(String type, Instant start, Instant end);
    List<EvidenceJpaEntity> findByReferenceId(String referenceId);
}
