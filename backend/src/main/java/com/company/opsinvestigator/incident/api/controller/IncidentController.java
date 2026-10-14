package com.company.opsinvestigator.incident.api.controller;

import com.company.opsinvestigator.incident.api.dto.*;
import com.company.opsinvestigator.incident.api.mapper.IncidentMapper;
import com.company.opsinvestigator.incident.application.port.IncidentUseCasePort;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentEvidence;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.company.opsinvestigator.incident.domain.model.IncidentTimelineEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
@Tag(name = "Incidents", description = "Enterprise Incident Lifecycle & Investigation Gateway")
public class IncidentController {

    private final IncidentUseCasePort incidentService;
    private final IncidentMapper incidentMapper;

    public IncidentController(IncidentUseCasePort incidentService, IncidentMapper incidentMapper) {
        this.incidentService = incidentService;
        this.incidentMapper = incidentMapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Detect or declare a new production incident")
    public ResponseEntity<IncidentResponse> createIncident(@Valid @RequestBody CreateIncidentRequest request) {
        Incident incident = incidentService.createIncident(
                request.title(),
                request.description(),
                request.severity(),
                request.environment(),
                request.serviceName(),
                request.startedAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentMapper.toResponse(incident));
    }

    @GetMapping
    @Operation(summary = "Retrieve paginated list of incidents with optional filters")
    public ResponseEntity<IncidentPageResponse> getIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) IncidentSeverity severity,
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String environment,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<IncidentResponse> content = incidentService.listIncidents(status, severity, serviceName, environment, page, size)
                .stream()
                .map(incidentMapper::toResponse)
                .toList();

        long total = incidentService.countIncidents(status, severity, serviceName, environment);

        return ResponseEntity.ok(IncidentPageResponse.of(content, page, size, total));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident details by unique UUID")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable UUID id) {
        Incident incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(incidentMapper.toResponse(incident));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update incident status using optimistic concurrency version control")
    public ResponseEntity<IncidentResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIncidentStatusRequest request) {
        Incident updated = incidentService.updateStatus(id, request.status(), request.reason(), request.expectedVersion());
        return ResponseEntity.ok(incidentMapper.toResponse(updated));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Retrieve chronological timeline entries for an incident")
    public ResponseEntity<List<IncidentTimelineEntryResponse>> getIncidentTimeline(@PathVariable UUID id) {
        List<IncidentTimelineEntry> entries = incidentService.getTimeline(id);
        List<IncidentTimelineEntryResponse> response = entries.stream()
                .map(incidentMapper::toTimelineResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/evidence")
    @Operation(summary = "Retrieve non-destructive telemetry and log storage evidence references for an incident")
    public ResponseEntity<List<IncidentEvidenceResponse>> getIncidentEvidence(@PathVariable UUID id) {
        List<IncidentEvidence> evidenceList = incidentService.getEvidence(id);
        List<IncidentEvidenceResponse> response = evidenceList.stream()
                .map(incidentMapper::toEvidenceResponse)
                .toList();
        return ResponseEntity.ok(response);
    }
}
