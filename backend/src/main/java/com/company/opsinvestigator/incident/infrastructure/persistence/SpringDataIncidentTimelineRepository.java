package com.company.opsinvestigator.incident.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataIncidentTimelineRepository extends JpaRepository<IncidentTimelineJpaEntity, UUID> {
    List<IncidentTimelineJpaEntity> findByIncidentIdOrderByTimestampAsc(UUID incidentId);
}
