package com.company.opsinvestigator.audit.infrastructure;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SpringDataAuditRecordRepository extends JpaRepository<AuditRecordJpaEntity, UUID> {

    @Query("SELECT a FROM AuditRecordJpaEntity a ORDER BY a.createdAt DESC")
    List<AuditRecordJpaEntity> findRecent(Pageable pageable);

    @Query("SELECT a FROM AuditRecordJpaEntity a WHERE a.targetType = :targetType AND a.targetId = :targetId ORDER BY a.createdAt DESC")
    List<AuditRecordJpaEntity> findByTarget(@Param("targetType") String targetType, @Param("targetId") String targetId);
}
