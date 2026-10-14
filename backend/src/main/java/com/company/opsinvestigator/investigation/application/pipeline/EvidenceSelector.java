package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.evidence.domain.model.Evidence;
import com.company.opsinvestigator.evidence.domain.repository.EvidenceRepository;
import com.company.opsinvestigator.incident.domain.model.Incident;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Selects and ranks highest relevance telemetry evidence for the investigation window.
 */
public class EvidenceSelector {

    private final EvidenceRepository evidenceRepository;

    public EvidenceSelector(EvidenceRepository evidenceRepository) {
        this.evidenceRepository = evidenceRepository;
    }

    public List<Evidence> selectEvidenceForIncident(Incident incident, int maxEvidenceCount) {
        List<Evidence> allEvidence = evidenceRepository.findByIncidentId(incident.getId());
        if (allEvidence == null || allEvidence.isEmpty()) {
            return List.of();
        }

        // Rank by relevance score, confidence, and temporal proximity to incident detection
        return allEvidence.stream()
                .sorted(Comparator.comparingDouble(Evidence::getRelevanceScore).reversed()
                        .thenComparing(Comparator.comparingDouble(Evidence::getConfidence).reversed()))
                .limit(maxEvidenceCount)
                .collect(Collectors.toList());
    }
}
