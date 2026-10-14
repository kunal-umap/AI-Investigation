package com.company.opsinvestigator.investigation.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataInvestigationHypothesisRepository extends JpaRepository<InvestigationHypothesisJpaEntity, UUID> {
    List<InvestigationHypothesisJpaEntity> findByInvestigationId(UUID investigationId);
}
