package com.company.opsinvestigator.incident.api.controller;

import com.company.opsinvestigator.incident.api.dto.IncidentResolutionRequest;
import com.company.opsinvestigator.incident.api.dto.IncidentResponse;
import com.company.opsinvestigator.incident.api.mapper.IncidentMapper;
import com.company.opsinvestigator.incident.application.service.IncidentResolutionService;
import com.company.opsinvestigator.incident.domain.model.Incident;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
@CrossOrigin(origins = "*")
public class IncidentResolutionController {

    private final IncidentResolutionService resolutionService;

    public IncidentResolutionController(IncidentResolutionService resolutionService) {
        this.resolutionService = resolutionService;
    }

    @PostMapping("/{id}/resolution")
    public ResponseEntity<IncidentResponse> resolveIncident(
            @PathVariable UUID id,
            @RequestBody IncidentResolutionRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "lead-sre-1") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "ENGINEER") String userRole
    ) {
        Incident resolved = resolutionService.resolveIncidentWithKnowledgeLearning(
                id, request, userId, userRole
        );
        return ResponseEntity.ok(IncidentMapper.toResponse(resolved));
    }
}
