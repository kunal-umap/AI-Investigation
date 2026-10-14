package com.company.opsinvestigator.incident.application.service;

import com.company.opsinvestigator.common.event.EventPublisher;
import com.company.opsinvestigator.common.exception.ResourceNotFoundException;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.company.opsinvestigator.incident.domain.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentApplicationServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private EventPublisher eventPublisher;

    private IncidentApplicationService incidentService;

    @BeforeEach
    void setUp() {
        incidentService = new IncidentApplicationService(incidentRepository, eventPublisher);
    }

    @Test
    @DisplayName("Should create incident, record timeline entry, and publish ops.incident.detected event")
    void shouldCreateIncidentSuccessfully() {
        when(incidentRepository.nextIncidentKey()).thenReturn("INC-2026-0001");
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incident created = incidentService.createIncident(
                "High latency on checkout",
                "P99 latency exceeding 5s threshold",
                IncidentSeverity.CRITICAL,
                "production",
                "checkout-service",
                Instant.now()
        );

        assertNotNull(created);
        assertEquals("INC-2026-0001", created.getIncidentKey());
        assertEquals(IncidentStatus.DETECTED, created.getStatus());

        verify(incidentRepository, times(1)).saveTimelineEntry(any());
        verify(eventPublisher, times(1)).publish(eq("ops.incident.detected"), any());
    }

    @Test
    @DisplayName("Should update status, save updated state, record timeline, and publish ops.incident.updated event")
    void shouldUpdateStatusSuccessfully() {
        UUID incidentId = UUID.randomUUID();
        Incident incident = Incident.createNew(
                "INC-2026-0002",
                "Memory leak",
                "OOM killer invoked on pods",
                IncidentSeverity.HIGH,
                "production",
                "inventory-service",
                Instant.now()
        );

        when(incidentRepository.findById(incidentId)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incident updated = incidentService.updateStatus(incidentId, IncidentStatus.INVESTIGATING, "Lead SRE triage started", 0L);

        assertEquals(IncidentStatus.INVESTIGATING, updated.getStatus());
        verify(incidentRepository, times(1)).save(any(Incident.class));
        verify(incidentRepository, times(1)).saveTimelineEntry(any());
        verify(eventPublisher, times(1)).publish(eq("ops.incident.updated"), any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when incident does not exist")
    void shouldThrowExceptionWhenNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(incidentRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                incidentService.getIncidentById(nonExistentId));
    }
}
