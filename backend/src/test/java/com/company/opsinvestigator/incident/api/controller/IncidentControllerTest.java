package com.company.opsinvestigator.incident.api.controller;

import com.company.opsinvestigator.common.exception.GlobalExceptionHandler;
import com.company.opsinvestigator.common.exception.ResourceNotFoundException;
import com.company.opsinvestigator.incident.api.dto.CreateIncidentRequest;
import com.company.opsinvestigator.incident.api.dto.UpdateIncidentStatusRequest;
import com.company.opsinvestigator.incident.api.mapper.IncidentMapper;
import com.company.opsinvestigator.incident.application.port.IncidentUseCasePort;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class IncidentControllerTest {

    private MockMvc mockMvc;
    private IncidentUseCasePort incidentService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        incidentService = mock(IncidentUseCasePort.class);
        IncidentMapper incidentMapper = new IncidentMapper();
        IncidentController controller = new IncidentController(incidentService, incidentMapper);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    @Test
    @DisplayName("POST /api/v1/incidents should return 201 Created for valid payload")
    void shouldCreateIncident() throws Exception {
        UUID id = UUID.randomUUID();
        Incident incident = new Incident(
                id,
                "INC-2026-0001",
                "High 5xx in auth-service",
                "Spike in HTTP 500 error responses",
                IncidentStatus.DETECTED,
                IncidentSeverity.CRITICAL,
                "production",
                "auth-service",
                Instant.now(),
                Instant.now(),
                null,
                Instant.now(),
                Instant.now(),
                0L
        );

        when(incidentService.createIncident(anyString(), anyString(), any(), anyString(), anyString(), any()))
                .thenReturn(incident);

        CreateIncidentRequest request = new CreateIncidentRequest(
                "High 5xx in auth-service",
                "Spike in HTTP 500 error responses",
                IncidentSeverity.CRITICAL,
                "production",
                "auth-service",
                Instant.now()
        );

        mockMvc.perform(post("/api/v1/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.incidentKey").value("INC-2026-0001"))
                .andExpect(jsonPath("$.status").value("DETECTED"))
                .andExpect(jsonPath("$.severity").value("CRITICAL"));
    }

    @Test
    @DisplayName("POST /api/v1/incidents should return 400 Bad Request on invalid fields")
    void shouldReturnBadRequestOnValidationFailure() throws Exception {
        // Missing required fields
        CreateIncidentRequest invalidRequest = new CreateIncidentRequest(
                "",
                "",
                null,
                "",
                "",
                null
        );

        mockMvc.perform(post("/api/v1/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://ops-investigator.company.com/errors/bad-request"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/v1/incidents should return paginated list")
    void shouldGetIncidentsPage() throws Exception {
        when(incidentService.listIncidents(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(Collections.emptyList());
        when(incidentService.countIncidents(any(), any(), any(), any())).thenReturn(0L);

        mockMvc.perform(get("/api/v1/incidents?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/incidents/{id} should return 404 Problem Details when not found")
    void shouldReturn404WhenNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        when(incidentService.getIncidentById(nonExistentId))
                .thenThrow(new ResourceNotFoundException("Incident not found with ID: " + nonExistentId));

        mockMvc.perform(get("/api/v1/incidents/" + nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://ops-investigator.company.com/errors/not-found"))
                .andExpect(jsonPath("$.title").value("Resource Not Found"))
                .andExpect(jsonPath("$.status").value(404));
    }
}
