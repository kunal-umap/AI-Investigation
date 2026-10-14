package com.company.opsinvestigator.incident.application.service;

import com.company.opsinvestigator.audit.application.AuditService;
import com.company.opsinvestigator.audit.domain.AuditAction;
import com.company.opsinvestigator.incident.api.dto.IncidentResolutionRequest;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.company.opsinvestigator.incident.domain.repository.IncidentRepository;
import com.company.opsinvestigator.knowledge.application.port.KnowledgeSearchPort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Knowledge Learning from Resolved Incidents:
 * When an engineer resolves an incident, allow:
 * POST /api/v1/incidents/{id}/resolution
 * After human confirmation, creates a verified HistoricalIncident knowledge record.
 * CRITICAL: Do NOT automatically treat AI hypotheses as truth. Only human-confirmed resolution becomes verified knowledge.
 */
@Service
public class IncidentResolutionService {

    private final IncidentRepository incidentRepository;
    private final KnowledgeSearchPort knowledgeSearchPort;
    private final AuditService auditService;

    public IncidentResolutionService(IncidentRepository incidentRepository,
                                    KnowledgeSearchPort knowledgeSearchPort,
                                    AuditService auditService) {
        this.incidentRepository = incidentRepository;
        this.knowledgeSearchPort = knowledgeSearchPort;
        this.auditService = auditService;
    }

    public Incident resolveIncidentWithKnowledgeLearning(
            UUID incidentId,
            IncidentResolutionRequest request,
            String actorId,
            String actorRole
    ) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        // 1. Transition incident status to RESOLVED
        incident.transitionTo(IncidentStatus.RESOLVED);
        Incident updatedIncident = incidentRepository.save(incident);

        // 2. Ingest verified human knowledge record
        String docId = "KB-HIST-" + incident.getIncidentKey();
        String fullContent = String.format(
                "Human Confirmed Root Cause: %s\n\nActual Resolution: %s\n\nAffected Component: %s\n\nLessons Learned: %s\n\nPreventive Action: %s\n\nRelated Runbook: %s",
                request.confirmedRootCause(),
                request.actualResolution(),
                request.affectedComponent(),
                request.lessonsLearned(),
                request.preventiveAction(),
                request.relatedRunbook()
        );

        knowledgeSearchPort.ingestDocument(
                docId,
                "HISTORICAL_INCIDENT",
                incident.getService(),
                request.affectedComponent() != null ? request.affectedComponent() : incident.getService(),
                "Verified Resolution: " + incident.getTitle(),
                fullContent,
                List.of("verified-resolution", incident.getService(), "postmortem"),
                "ENGINEER"
        );

        // 3. Security Audit record
        auditService.log(
                AuditAction.STATUS_UPDATED,
                actorId,
                "Incident " + incidentId + " resolved and verified knowledge record " + docId + " ingested by " + actorRole
        );

        return updatedIncident;
    }
}
