package com.company.opsinvestigator.incident.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataIncidentEvidenceRepository extends JpaRepository<IncidentEvidenceJpaEntity, UUID> {
    List<IncidentEvidenceJpaEntity> findByIncidentIdOrderByRelevanceScoreDesc(UUID incidentId);
}
