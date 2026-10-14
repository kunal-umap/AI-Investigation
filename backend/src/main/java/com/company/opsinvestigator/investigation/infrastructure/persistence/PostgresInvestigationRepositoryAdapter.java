package com.company.opsinvestigator.investigation.infrastructure.persistence;

import com.company.opsinvestigator.investigation.domain.model.*;
import com.company.opsinvestigator.investigation.domain.repository.InvestigationRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PostgresInvestigationRepositoryAdapter implements InvestigationRepository {

    private final SpringDataInvestigationRepository jpaRepository;
    private final SpringDataInvestigationFindingRepository findingRepository;
    private final SpringDataInvestigationHypothesisRepository hypothesisRepository;
    private final SpringDataInvestigationRecommendationRepository recommendationRepository;

    public PostgresInvestigationRepositoryAdapter(
            SpringDataInvestigationRepository jpaRepository,
            SpringDataInvestigationFindingRepository findingRepository,
            SpringDataInvestigationHypothesisRepository hypothesisRepository,
            SpringDataInvestigationRecommendationRepository recommendationRepository) {
        this.jpaRepository = jpaRepository;
        this.findingRepository = findingRepository;
        this.hypothesisRepository = hypothesisRepository;
        this.recommendationRepository = recommendationRepository;
    }

    @Override
    public Investigation save(Investigation investigation) {
        InvestigationJpaEntity entity = InvestigationJpaEntity.fromDomain(investigation);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Investigation> findById(UUID id) {
        return jpaRepository.findById(id).map(InvestigationJpaEntity::toDomain);
    }

    @Override
    public Optional<Investigation> findByIncidentId(UUID incidentId) {
        return jpaRepository.findByIncidentId(incidentId).map(InvestigationJpaEntity::toDomain);
    }

    @Override
    public List<Investigation> findAllByIncidentId(UUID incidentId) {
        return jpaRepository.findAllByIncidentIdOrderByStartedAtDesc(incidentId).stream()
                .map(InvestigationJpaEntity::toDomain)
                .toList();
    }

    @Override
    public InvestigationFinding saveFinding(InvestigationFinding finding) {
        InvestigationFindingJpaEntity entity = InvestigationFindingJpaEntity.fromDomain(finding);
        return findingRepository.save(entity).toDomain();
    }

    @Override
    public Optional<InvestigationFinding> findFindingById(UUID findingId) {
        return findingRepository.findById(findingId).map(InvestigationFindingJpaEntity::toDomain);
    }

    @Override
    public List<InvestigationFinding> findFindings(UUID investigationId) {
        return findingRepository.findByInvestigationIdOrderByTimestampAsc(investigationId).stream()
                .map(InvestigationFindingJpaEntity::toDomain)
                .toList();
    }

    @Override
    public InvestigationHypothesis saveHypothesis(InvestigationHypothesis hypothesis) {
        InvestigationHypothesisJpaEntity entity = InvestigationHypothesisJpaEntity.fromDomain(hypothesis);
        return hypothesisRepository.save(entity).toDomain();
    }

    @Override
    public Optional<InvestigationHypothesis> findHypothesisById(UUID hypothesisId) {
        return hypothesisRepository.findById(hypothesisId).map(InvestigationHypothesisJpaEntity::toDomain);
    }

    @Override
    public List<InvestigationHypothesis> findHypotheses(UUID investigationId) {
        return hypothesisRepository.findByInvestigationId(investigationId).stream()
                .map(InvestigationHypothesisJpaEntity::toDomain)
                .toList();
    }

    @Override
    public InvestigationRecommendation saveRecommendation(InvestigationRecommendation recommendation) {
        InvestigationRecommendationJpaEntity entity = InvestigationRecommendationJpaEntity.fromDomain(recommendation);
        return recommendationRepository.save(entity).toDomain();
    }

    @Override
    public List<InvestigationRecommendation> findRecommendations(UUID investigationId) {
        return recommendationRepository.findByInvestigationId(investigationId).stream()
                .map(InvestigationRecommendationJpaEntity::toDomain)
                .toList();
    }
}
