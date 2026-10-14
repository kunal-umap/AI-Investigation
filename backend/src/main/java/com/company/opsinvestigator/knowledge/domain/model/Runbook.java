package com.company.opsinvestigator.knowledge.domain.model;

import java.time.Instant;
import java.util.UUID;

public record Runbook(
        UUID id,
        String serviceName,
        String title,
        String triggerCondition,
        String stepInstructionsRef,
        boolean isReadOnlySafe,
        Instant lastVerifiedAt
) {
    public static Runbook of(String service, String title, String condition, String stepRef, boolean readOnlySafe) {
        return new Runbook(UUID.randomUUID(), service, title, condition, stepRef, readOnlySafe, Instant.now());
    }
}
