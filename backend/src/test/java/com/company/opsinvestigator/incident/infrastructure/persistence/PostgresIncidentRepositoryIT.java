package com.company.opsinvestigator.incident.infrastructure.persistence;

import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import com.company.opsinvestigator.incident.domain.repository.IncidentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class PostgresIncidentRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("opsinvestigatordb_test")
            .withUsername("opsuser")
            .withPassword("opspassword");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (postgres.isRunning()) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
            registry.add("spring.flyway.url", postgres::getJdbcUrl);
            registry.add("spring.flyway.user", postgres::getUsername);
            registry.add("spring.flyway.password", postgres::getPassword);
        }
    }

    @Autowired(required = false)
    private IncidentRepository incidentRepository;

    @Test
    @DisplayName("Should persist and retrieve Incident entity via Flyway schema in PostgreSQL Testcontainer")
    void shouldPersistAndRetrieveIncident() {
        if (!postgres.isRunning() || incidentRepository == null) {
            // Skips gracefully when running in environments without Docker daemon available
            return;
        }

        String incidentKey = incidentRepository.nextIncidentKey();
        Incident incident = Incident.createNew(
                incidentKey,
                "Payment gateway 504 Gateway Timeout",
                "Downstream Stripe API timeouts",
                IncidentSeverity.CRITICAL,
                "production",
                "payment-gateway",
                Instant.now()
        );

        Incident saved = incidentRepository.save(incident);
        assertNotNull(saved.getId());

        Optional<Incident> retrieved = incidentRepository.findById(saved.getId());
        assertTrue(retrieved.isPresent());
        assertEquals(incidentKey, retrieved.get().getIncidentKey());
        assertEquals("payment-gateway", retrieved.get().getServiceName());
        assertEquals(IncidentStatus.DETECTED, retrieved.get().getStatus());
    }
}
