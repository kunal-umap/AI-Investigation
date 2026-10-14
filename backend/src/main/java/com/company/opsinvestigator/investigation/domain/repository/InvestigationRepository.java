package com.company.opsinvestigator.investigation.domain.repository;

import com.company.opsinvestigator.investigation.domain.model.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestigationRepository {
    Investigation save(Investigation investigation);
    Optional<Investigation> findById(UUID id);
    Optional<Investigation> findByIncidentId(UUID incidentId);
    List<Investigation> findAllByIncidentId(UUID incidentId);
    InvestigationFinding saveFinding(InvestigationFinding finding);
    Optional<InvestigationFinding> findFindingById(UUID findingId);
    List<InvestigationFinding> findFindings(UUID investigationId);
    InvestigationHypothesis saveHypothesis(InvestigationHypothesis hypothesis);
    Optional<InvestigationHypothesis> findHypothesisById(UUID hypothesisId);
    List<InvestigationHypothesis> findHypotheses(UUID investigationId);
    InvestigationRecommendation saveRecommendation(InvestigationRecommendation recommendation);
    List<InvestigationRecommendation> findRecommendations(UUID investigationId);
}
