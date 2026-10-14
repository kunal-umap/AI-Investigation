package com.company.opsinvestigator.investigation.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpringDataInvestigationRepository extends JpaRepository<InvestigationJpaEntity, UUID> {
    Optional<InvestigationJpaEntity> findByIncidentId(UUID incidentId);
    java.util.List<InvestigationJpaEntity> findAllByIncidentIdOrderByStartedAtDesc(UUID incidentId);
}
