package com.company.opsinvestigator.change.domain.model;

import java.time.Instant;
import java.util.UUID;

public record ConfigurationChange(
        UUID id,
        String serviceName,
        String environment,
        String configKey,
        String previousHash,
        String newHash,
        String changedBy,
        Instant changedAt,
        String reason
) {
    public static ConfigurationChange of(String service, String env, String key, String prevHash, String newHash, String by, Instant at, String reason) {
        return new ConfigurationChange(UUID.randomUUID(), service, env, key, prevHash, newHash, by, at, reason);
    }
}
