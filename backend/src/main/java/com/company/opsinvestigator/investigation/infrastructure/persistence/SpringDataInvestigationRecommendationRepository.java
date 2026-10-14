package com.company.opsinvestigator.investigation.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataInvestigationRecommendationRepository extends JpaRepository<InvestigationRecommendationJpaEntity, UUID> {
    List<InvestigationRecommendationJpaEntity> findByInvestigationId(UUID investigationId);
}
