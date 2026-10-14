package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.audit.application.AuditService;
import com.company.opsinvestigator.audit.domain.AuditAction;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.investigation.application.port.AiInvestigationPort;
import com.company.opsinvestigator.investigation.domain.model.InvestigationContext;
import com.company.opsinvestigator.investigation.domain.model.InvestigationReport;
import com.company.opsinvestigator.investigation.domain.model.InvestigationResult;
import com.company.opsinvestigator.investigation.domain.model.QualityMetrics;

import java.time.Instant;
import java.util.UUID;

/**
 * Stage 3 Investigation Pipeline:
 * Incident
 *   ↓
 * IncidentContextBuilder
 *   ↓
 * EvidenceSelector
 *   ↓
 * KnowledgeRetriever
 *   ↓
 * ChangeRetriever
 *   ↓
 * PromptBuilder
 *   ↓
 * Gemini (AiInvestigationPort)
 *   ↓
 * Structured InvestigationResult
 *   ↓
 * EvidenceValidator
 *   ↓
 * InvestigationReport
 */
public class InvestigationPipeline {

    private final IncidentContextBuilder contextBuilder;
    private final AiInvestigationPort aiInvestigationPort;
    private final EvidenceValidator evidenceValidator;
    private final AuditService auditService;

    public InvestigationPipeline(IncidentContextBuilder contextBuilder,
                                 AiInvestigationPort aiInvestigationPort,
                                 EvidenceValidator evidenceValidator,
                                 AuditService auditService) {
        this.contextBuilder = contextBuilder;
        this.aiInvestigationPort = aiInvestigationPort;
        this.evidenceValidator = evidenceValidator;
        this.auditService = auditService;
    }

    public InvestigationReport execute(Incident incident, String requestingUserId, String requestingUserRole) {
        long startTime = System.currentTimeMillis();

        // 1. Build context with Evidence, Knowledge, Changes
        InvestigationContext context = contextBuilder.buildContext(incident, requestingUserId, requestingUserRole);

        // 2. Query Gemini via Port
        InvestigationResult rawResult = aiInvestigationPort.investigate(context);

        long duration = System.currentTimeMillis() - startTime;

        // 3. Assemble Quality Metrics
        QualityMetrics metrics = new QualityMetrics(
                aiInvestigationPort.getModelName(),
                aiInvestigationPort.getModelVersion(),
                aiInvestigationPort.getPromptVersion(),
                Instant.now(),
                context.selectedEvidence().size(),
                context.knowledgeSnippets().size(),
                context.candidateChanges().size(),
                rawResult.confidence(),
                duration,
                false,
                false
        );

        // 4. Validate evidence citations and reject ungrounded references
        UUID investigationId = UUID.randomUUID();
        InvestigationReport report = evidenceValidator.validateAndBuildReport(
                investigationId,
                context,
                rawResult,
                metrics
        );

        // 5. Security audit logging
        if (auditService != null) {
            auditService.log(
                    AuditAction.INVESTIGATION_CREATED,
                    requestingUserId,
                    "AI Investigation generated with model " + aiInvestigationPort.getModelName()
                            + " for incident " + incident.getId()
                            + ". Validated evidence citations: " + report.validatedEvidenceReferences().size()
                            + ", Rejected hallucinations: " + report.rejectedInvalidEvidenceIds().size()
            );
        }

        return report;
    }
}
