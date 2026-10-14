package com.company.opsinvestigator.investigation.application.port;

import com.company.opsinvestigator.investigation.domain.model.InvestigationContext;
import com.company.opsinvestigator.investigation.domain.model.InvestigationResult;

/**
 * Port abstraction decoupling domain logic from specific AI / Gemini / Vertex AI vendor details.
 * CRITICAL SAFETY PRINCIPLE: The AI is strictly read-only.
 */
public interface AiInvestigationPort {

    /**
     * Conducts a structured incident investigation given the assembled context.
     * Must return strongly structured InvestigationResult without executing any actions.
     */
    InvestigationResult investigate(InvestigationContext context);

    /**
     * Returns runtime model telemetry details for audit and quality tracking.
     */
    String getModelName();

    String getModelVersion();

    String getPromptVersion();
}
