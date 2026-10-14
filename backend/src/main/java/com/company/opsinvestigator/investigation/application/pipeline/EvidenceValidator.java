package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.investigation.domain.model.AiObservation;
import com.company.opsinvestigator.investigation.domain.model.AiRecentChange;
import com.company.opsinvestigator.investigation.domain.model.AiRecommendedCheck;
import com.company.opsinvestigator.investigation.domain.model.InvestigationContext;
import com.company.opsinvestigator.investigation.domain.model.InvestigationReport;
import com.company.opsinvestigator.investigation.domain.model.InvestigationResult;
import com.company.opsinvestigator.investigation.domain.model.QualityMetrics;
import com.company.opsinvestigator.investigation.domain.model.AiHypothesis;
import com.company.opsinvestigator.investigation.domain.model.HypothesisStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Validates that every evidence reference in AI findings actually exists in the InvestigationContext.
 * Rejects or strips hallucinated / nonexistent evidence citations.
 */
public class EvidenceValidator {

    public InvestigationReport validateAndBuildReport(
            UUID investigationId,
            InvestigationContext context,
            InvestigationResult rawResult,
            QualityMetrics metrics
    ) {
        Set<String> validEvidenceIds = context.getValidEvidenceIds();

        List<String> validatedReferences = new ArrayList<>();
        List<String> rejectedInvalidIds = new ArrayList<>();

        // Validate hypotheses citations
        List<AiHypothesis> validatedHypotheses = new ArrayList<>();
        for (AiHypothesis hyp : rawResult.hypotheses()) {
            List<String> validSupporting = new ArrayList<>();
            for (String evId : hyp.supportingEvidenceIds()) {
                if (validEvidenceIds.contains(evId)) {
                    validSupporting.add(evId);
                    if (!validatedReferences.contains(evId)) {
                        validatedReferences.add(evId);
                    }
                } else {
                    rejectedInvalidIds.add(evId);
                }
            }

            List<String> validContradicting = new ArrayList<>();
            for (String evId : hyp.contradictingEvidenceIds()) {
                if (validEvidenceIds.contains(evId)) {
                    validContradicting.add(evId);
                    if (!validatedReferences.contains(evId)) {
                        validatedReferences.add(evId);
                    }
                } else {
                    rejectedInvalidIds.add(evId);
                }
            }

            // Ensure model never assigned CONFIRMED_BY_HUMAN autonomously
            HypothesisStatus safeStatus = hyp.status();
            if (safeStatus == HypothesisStatus.CONFIRMED_BY_HUMAN) {
                safeStatus = HypothesisStatus.LIKELY;
            }

            validatedHypotheses.add(new AiHypothesis(
                    hyp.id(),
                    hyp.statement(),
                    hyp.confidence(),
                    validSupporting,
                    validContradicting,
                    safeStatus
            ));
        }

        // Validate observations citations
        List<AiObservation> validatedObservations = new ArrayList<>();
        for (AiObservation obs : rawResult.observations()) {
            List<String> validRefs = new ArrayList<>();
            for (String evId : obs.evidenceReferences()) {
                if (validEvidenceIds.contains(evId)) {
                    validRefs.add(evId);
                    if (!validatedReferences.contains(evId)) {
                        validatedReferences.add(evId);
                    }
                } else {
                    rejectedInvalidIds.add(evId);
                }
            }
            validatedObservations.add(new AiObservation(
                    obs.id(),
                    obs.category(),
                    obs.statement(),
                    obs.severityScore(),
                    validRefs
            ));
        }

        // Validate recent changes citations
        List<AiRecentChange> validatedChanges = new ArrayList<>();
        for (AiRecentChange ch : rawResult.recentChanges()) {
            List<String> validRefs = new ArrayList<>();
            for (String evId : ch.evidenceReferences()) {
                if (validEvidenceIds.contains(evId)) {
                    validRefs.add(evId);
                    if (!validatedReferences.contains(evId)) {
                        validatedReferences.add(evId);
                    }
                } else {
                    rejectedInvalidIds.add(evId);
                }
            }
            validatedChanges.add(new AiRecentChange(
                    ch.changeId(),
                    ch.type(),
                    ch.description(),
                    ch.timestamp(),
                    ch.service(),
                    ch.component(),
                    ch.temporalProximityMinutes(),
                    ch.potentialRelationship(),
                    validRefs
            ));
        }

        return new InvestigationReport(
                investigationId,
                context.incident().getId(),
                rawResult.summary(),
                rawResult.impact(),
                rawResult.timeline(),
                validatedObservations,
                validatedHypotheses,
                rawResult.similarIncidents(),
                validatedChanges,
                rawResult.recommendedChecks(),
                rawResult.unknowns(),
                rawResult.confidence(),
                validatedReferences,
                rejectedInvalidIds,
                metrics,
                Instant.now()
        );
    }
}
