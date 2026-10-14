package com.company.opsinvestigator.audit.domain;

import java.time.Instant;
import java.util.UUID;

public record AuditRecord(
        UUID id,
        AuditAction action,
        String actor,
        String role,
        String targetType,
        String targetId,
        String details,
        Instant createdAt
) {
    public static AuditRecord of(AuditAction action, String actor, String role, String targetType, String targetId, String details) {
        return new AuditRecord(UUID.randomUUID(), action, actor, role, targetType, targetId, details, Instant.now());
    }
}
