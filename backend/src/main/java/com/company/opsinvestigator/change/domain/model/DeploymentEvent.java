package com.company.opsinvestigator.change.domain.model;

import java.time.Instant;
import java.util.UUID;

public record DeploymentEvent(
        UUID id,
        String serviceName,
        String environment,
        String versionTag,
        String commitSha,
        String deployedBy,
        Instant deployedAt,
        String status,
        String changeUrl
) {
    public static DeploymentEvent of(String service, String env, String version, String sha, String by, Instant at, String status, String url) {
        return new DeploymentEvent(UUID.randomUUID(), service, env, version, sha, by, at, status, url);
    }
}
