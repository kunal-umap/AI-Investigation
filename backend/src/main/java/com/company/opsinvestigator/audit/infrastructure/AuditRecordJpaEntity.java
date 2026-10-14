package com.company.opsinvestigator.audit.infrastructure;

import com.company.opsinvestigator.audit.domain.AuditAction;
import com.company.opsinvestigator.audit.domain.AuditRecord;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_records")
public class AuditRecordJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 64)
    private AuditAction action;

    @Column(name = "actor", nullable = false, length = 128)
    private String actor;

    @Column(name = "role", nullable = false, length = 64)
    private String role;

    @Column(name = "target_type", nullable = false, length = 64)
    private String targetType;

    @Column(name = "target_id", nullable = false, length = 128)
    private String targetId;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public AuditRecordJpaEntity() {}

    public static AuditRecordJpaEntity fromDomain(AuditRecord domain) {
        AuditRecordJpaEntity entity = new AuditRecordJpaEntity();
        entity.id = domain.id();
        entity.action = domain.action();
        entity.actor = domain.actor();
        entity.role = domain.role();
        entity.targetType = domain.targetType();
        entity.targetId = domain.targetId();
        entity.details = domain.details();
        entity.createdAt = domain.createdAt();
        return entity;
    }

    public AuditRecord toDomain() {
        return new AuditRecord(id, action, actor, role, targetType, targetId, details, createdAt);
    }

    public UUID getId() { return id; }
    public AuditAction getAction() { return action; }
    public String getActor() { return actor; }
    public String getRole() { return role; }
    public String getTargetType() { return targetType; }
    public String getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}
