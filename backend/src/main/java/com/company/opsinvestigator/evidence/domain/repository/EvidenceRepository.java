package com.company.opsinvestigator.evidence.domain.repository;

import com.company.opsinvestigator.evidence.domain.model.Evidence;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvidenceRepository {
    Evidence save(Evidence evidence);
    Optional<Evidence> findById(UUID id);
    List<Evidence> findByTypeAndTimestampBetween(String type, Instant start, Instant end);
    List<Evidence> findByReferenceId(String referenceId);
}
