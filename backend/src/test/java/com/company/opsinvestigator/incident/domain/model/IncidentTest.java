package com.company.opsinvestigator.incident.domain.model;

import com.company.opsinvestigator.common.exception.InvalidStateTransitionException;
import com.company.opsinvestigator.common.exception.OptimisticLockingException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class IncidentTest {

    @Test
    @DisplayName("Should initialize newly detected incident with version 0 and DETECTED status")
    void shouldCreateNewIncident() {
        Incident incident = Incident.createNew(
                "INC-2026-0001",
                "High 5xx in auth-service",
                "Spike in HTTP 500 error responses",
                IncidentSeverity.CRITICAL,
                "production",
                "auth-service",
                Instant.now()
        );

        assertNotNull(incident.getId());
        assertEquals("INC-2026-0001", incident.getIncidentKey());
        assertEquals(IncidentStatus.DETECTED, incident.getStatus());
        assertEquals(IncidentSeverity.CRITICAL, incident.getSeverity());
        assertEquals(0L, incident.getVersion());
        assertNull(incident.getResolvedAt());
    }

    @Test
    @DisplayName("Should successfully update status when expected version matches")
    void shouldUpdateStatusWhenVersionMatches() {
        Incident incident = Incident.createNew(
                "INC-2026-0002",
                "Database deadlock",
                "PostgreSQL locking contention",
                IncidentSeverity.HIGH,
                "production",
                "payment-service",
                Instant.now()
        );

        incident.updateStatus(IncidentStatus.INVESTIGATING, 0L);
        assertEquals(IncidentStatus.INVESTIGATING, incident.getStatus());

        incident.updateStatus(IncidentStatus.MITIGATED, 0L);
        assertEquals(IncidentStatus.MITIGATED, incident.getStatus());

        incident.updateStatus(IncidentStatus.RESOLVED, 0L);
        assertEquals(IncidentStatus.RESOLVED, incident.getStatus());
        assertNotNull(incident.getResolvedAt());
    }

    @Test
    @DisplayName("Should throw OptimisticLockingException when version does not match")
    void shouldThrowOptimisticLockExceptionOnVersionMismatch() {
        Incident incident = Incident.createNew(
                "INC-2026-0003",
                "Cache stampede",
                "Redis connection pool exhausted",
                IncidentSeverity.MEDIUM,
                "production",
                "catalog-service",
                Instant.now()
        );

        assertThrows(OptimisticLockingException.class, () ->
                incident.updateStatus(IncidentStatus.INVESTIGATING, 99L));
    }

    @Test
    @DisplayName("Should throw InvalidStateTransitionException on illegal status transitions")
    void shouldThrowExceptionOnIllegalTransition() {
        Incident incident = Incident.createNew(
                "INC-2026-0004",
                "Worker timeout",
                "Celery task timeout",
                IncidentSeverity.LOW,
                "staging",
                "notification-worker",
                Instant.now()
        );

        // Move to CLOSED
        incident.updateStatus(IncidentStatus.CLOSED, 0L);

        // Cannot move from CLOSED back to INVESTIGATING
        assertThrows(InvalidStateTransitionException.class, () ->
                incident.updateStatus(IncidentStatus.INVESTIGATING, 0L));
    }
}
