package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.evidence.domain.model.Evidence;
import com.company.opsinvestigator.investigation.domain.model.AiRecentChange;
import com.company.opsinvestigator.investigation.domain.model.InvestigationContext;

/**
 * Constructs robust, safety-constrained system and user prompts for Gemini on Google Cloud / Vertex AI.
 * Explicitly forces structured JSON output and mandates conservative evidence citations.
 */
public class PromptBuilder {

    public static final String PROMPT_VERSION = "v3.2.0-readonly";

    public String buildSystemPrompt() {
        return """
            You are an enterprise production incident investigation assistant.
            You do not control production systems.
            You do not perform remediation.
            Your job is to investigate evidence supplied by the application.
            Never invent telemetry, incidents, changes, documents or metrics.
            Every factual conclusion must be supported by supplied evidence.
            Clearly distinguish:
            OBSERVATION
            CORRELATION
            HYPOTHESIS
            RECOMMENDATION
            Never state a root cause as confirmed unless the input explicitly says it has been human-confirmed.
            When evidence is insufficient, explicitly state insufficient evidence.
            Prefer conservative conclusions over speculative ones.
            Return structured JSON only conforming strictly to the requested schema.
            """;
    }

    public String buildUserPrompt(InvestigationContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append("INVESTIGATION CONTEXT:\n");
        sb.append("Incident ID: ").append(context.incident().getId()).append("\n");
        sb.append("Title: ").append(context.incident().getTitle()).append("\n");
        sb.append("Service: ").append(context.incident().getService()).append("\n");
        sb.append("Severity: ").append(context.incident().getSeverity()).append("\n");
        sb.append("Detected At: ").append(context.incident().getCreatedAt()).append("\n\n");

        sb.append("SUPPLIED TELEMETRY & SYSTEM EVIDENCE (Use ONLY these reference IDs for citations):\n");
        for (Evidence ev : context.selectedEvidence()) {
            sb.append("- Evidence ID: ").append(ev.getReferenceId())
                    .append(" | Type: ").append(ev.getType())
                    .append(" | Source: ").append(ev.getSource())
                    .append(" | Time: ").append(ev.getTimestamp())
                    .append(" | Summary: ").append(ev.getSummary())
                    .append("\n");
        }
        sb.append("\n");

        if (!context.candidateChanges().isEmpty()) {
            sb.append("RECENT CHANGES (Last 24h/Deployment Window):\n");
            for (AiRecentChange change : context.candidateChanges()) {
                sb.append("- Change ID: ").append(change.changeId())
                        .append(" | Type: ").append(change.type())
                        .append(" | Service: ").append(change.service())
                        .append(" | Time: ").append(change.timestamp())
                        .append(" | Description: ").append(change.description())
                        .append("\n");
            }
            sb.append("\n");
        }

        if (!context.knowledgeSnippets().isEmpty()) {
            sb.append("HISTORICAL KNOWLEDGE & POSTMORTEM SNIPPETS:\n");
            for (String snippet : context.knowledgeSnippets()) {
                sb.append("- ").append(snippet).append("\n");
            }
            sb.append("\n");
        }

        sb.append("""
            REQUIRED JSON OUTPUT STRUCTURE:
            {
              "summary": "Concise summary of the incident state",
              "impact": "Concrete customer/service impact analysis",
              "timeline": "Reconstructed sequence of events",
              "observations": [
                {
                  "id": "OBS-1",
                  "category": "METRIC|LOG|DATABASE|SERVER|DEPLOYMENT",
                  "statement": "Factual statement backed by evidence",
                  "severityScore": 0.85,
                  "evidenceReferences": ["EV-..."]
                }
              ],
              "hypotheses": [
                {
                  "id": "HYP-1",
                  "statement": "Hypothesis explaining the anomaly",
                  "confidence": 0.8,
                  "supportingEvidenceIds": ["EV-..."],
                  "contradictingEvidenceIds": [],
                  "status": "LIKELY"
                }
              ],
              "similarIncidents": [
                {
                  "incidentId": "INC-...",
                  "incidentKey": "OPS-...",
                  "title": "Title of past incident",
                  "similarityScore": 0.75,
                  "matchingSignals": ["Signal 1", "Signal 2"],
                  "historicalRootCause": "What caused it in the past",
                  "historicalResolution": "How it was fixed",
                  "originalIncidentReference": "KB-...",
                  "isSameIncident": false
                }
              ],
              "recentChanges": [
                {
                  "changeId": "CHG-...",
                  "type": "DEPLOYMENT|CONFIG_CHANGE|GIT_COMMIT|DB_MIGRATION",
                  "description": "Details",
                  "timestamp": "ISO-8601",
                  "service": "Service name",
                  "component": "Component name",
                  "temporalProximityMinutes": 45.0,
                  "potentialRelationship": "Potential correlation without asserting causality",
                  "evidenceReferences": ["EV-..."]
                }
              ],
              "recommendedChecks": [
                {
                  "id": "CHK-1",
                  "title": "Read-only inspection step",
                  "description": "What to inspect next",
                  "rationale": "Why this check is relevant",
                  "isHumanOnlyGuardrailEnforced": true,
                  "suggestedDiagnostics": ["diagnostic query or dashboard"]
                }
              ],
              "unknowns": [
                "Specific unknowns or insufficient evidence areas"
              ],
              "confidence": 0.85,
              "evidenceReferences": ["EV-..."]
            }
            CRITICAL CONSTRAINT: Do NOT cite any Evidence IDs that were not explicitly listed above in the SUPPLIED EVIDENCE section.
            """);

        return sb.toString();
    }
}
