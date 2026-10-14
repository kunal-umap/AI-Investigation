package com.company.opsinvestigator.investigation.api.controller;

import com.company.opsinvestigator.change.application.service.ChangeImpactAnalyzer;
import com.company.opsinvestigator.change.domain.model.ChangeGraph;
import com.company.opsinvestigator.evidence.domain.model.Evidence;
import com.company.opsinvestigator.evidence.domain.repository.EvidenceRepository;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.repository.IncidentRepository;
import com.company.opsinvestigator.investigation.application.pipeline.InvestigationPipeline;
import com.company.opsinvestigator.investigation.domain.model.AiRecentChange;
import com.company.opsinvestigator.investigation.domain.model.InvestigationFinding;
import com.company.opsinvestigator.investigation.domain.model.InvestigationReport;
import com.company.opsinvestigator.knowledge.application.service.SimilarIncidentEngine;
import com.company.opsinvestigator.knowledge.domain.model.SimilarIncidentMatch;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controller exposing Stage 3 AI Investigation endpoints:
 * POST /api/v1/incidents/{id}/investigate
 * GET /api/v1/investigations/{id}
 * GET /api/v1/investigations/{id}/findings
 * GET /api/v1/investigations/{id}/evidence
 * GET /api/v1/investigations/{id}/similar-incidents
 * GET /api/v1/investigations/{id}/changes
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AiInvestigationController {

    private final IncidentRepository incidentRepository;
    private final EvidenceRepository evidenceRepository;
    private final InvestigationPipeline investigationPipeline;
    private final SimilarIncidentEngine similarIncidentEngine;
    private final ChangeImpactAnalyzer changeImpactAnalyzer;

    // Report cache by investigation ID
    private final Map<UUID, InvestigationReport> reportStore = new ConcurrentHashMap<>();

    public AiInvestigationController(IncidentRepository incidentRepository,
                                   EvidenceRepository evidenceRepository,
                                   InvestigationPipeline investigationPipeline,
                                   SimilarIncidentEngine similarIncidentEngine,
                                   ChangeImpactAnalyzer changeImpactAnalyzer) {
        this.incidentRepository = incidentRepository;
        this.evidenceRepository = evidenceRepository;
        this.investigationPipeline = investigationPipeline;
        this.similarIncidentEngine = similarIncidentEngine;
        this.changeImpactAnalyzer = changeImpactAnalyzer;
    }

    @PostMapping("/incidents/{id}/investigate")
    public ResponseEntity<InvestigationReport> investigateIncident(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", defaultValue = "lead-sre-1") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "ENGINEER") String userRole
    ) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + id));

        InvestigationReport report = investigationPipeline.execute(incident, userId, userRole);
        reportStore.put(report.id(), report);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/investigations/{id}")
    public ResponseEntity<InvestigationReport> getInvestigation(@PathVariable UUID id) {
        InvestigationReport report = reportStore.get(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(report);
    }

    @GetMapping("/investigations/{id}/findings")
    public ResponseEntity<List<InvestigationFinding>> getInvestigationFindings(@PathVariable UUID id) {
        InvestigationReport report = reportStore.get(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        List<InvestigationFinding> findings = report.observations().stream()
                .map(obs -> new InvestigationFinding(
                        UUID.randomUUID(),
                        id,
                        obs.category(),
                        obs.statement(),
                        obs.severityScore(),
                        null
                ))
                .toList();
        return ResponseEntity.ok(findings);
    }

    @GetMapping("/investigations/{id}/evidence")
    public ResponseEntity<List<Evidence>> getInvestigationEvidence(@PathVariable UUID id) {
        InvestigationReport report = reportStore.get(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        List<Evidence> evidence = evidenceRepository.findByIncidentId(report.incidentId());
        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/investigations/{id}/similar-incidents")
    public ResponseEntity<List<SimilarIncidentMatch>> getSimilarIncidents(@PathVariable UUID id) {
        InvestigationReport report = reportStore.get(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        Incident incident = incidentRepository.findById(report.incidentId()).orElse(null);
        if (incident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(similarIncidentEngine.findSimilarIncidents(incident, 5));
    }

    @GetMapping("/investigations/{id}/changes")
    public ResponseEntity<List<AiRecentChange>> getInvestigationChanges(@PathVariable UUID id) {
        InvestigationReport report = reportStore.get(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(report.recentChanges());
    }

    @GetMapping("/change-graph/{service}")
    public ResponseEntity<ChangeGraph> getChangeGraph(@PathVariable String service) {
        return ResponseEntity.ok(changeImpactAnalyzer.buildDependencyGraphForService(service));
    }
}
