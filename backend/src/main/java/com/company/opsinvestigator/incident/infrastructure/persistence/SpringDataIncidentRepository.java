package com.company.opsinvestigator.incident.infrastructure.persistence;

import com.company.opsinvestigator.incident.domain.model.IncidentSeverity;
import com.company.opsinvestigator.incident.domain.model.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SpringDataIncidentRepository extends JpaRepository<IncidentJpaEntity, UUID> {

    Optional<IncidentJpaEntity> findByIncidentKey(String incidentKey);

    @Query("""
        SELECT i FROM IncidentJpaEntity i
        WHERE (:status IS NULL OR i.status = :status)
          AND (:severity IS NULL OR i.severity = :severity)
          AND (:serviceName IS NULL OR i.serviceName = :serviceName)
          AND (:environment IS NULL OR i.environment = :environment)
        ORDER BY i.startedAt DESC
    """)
    Page<IncidentJpaEntity> findFiltered(
            @Param("status") IncidentStatus status,
            @Param("severity") IncidentSeverity severity,
            @Param("serviceName") String serviceName,
            @Param("environment") String environment,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(i) FROM IncidentJpaEntity i
        WHERE (:status IS NULL OR i.status = :status)
          AND (:severity IS NULL OR i.severity = :severity)
          AND (:serviceName IS NULL OR i.serviceName = :serviceName)
          AND (:environment IS NULL OR i.environment = :environment)
    """)
    long countFiltered(
            @Param("status") IncidentStatus status,
            @Param("severity") IncidentSeverity severity,
            @Param("serviceName") String serviceName,
            @Param("environment") String environment
    );
}
