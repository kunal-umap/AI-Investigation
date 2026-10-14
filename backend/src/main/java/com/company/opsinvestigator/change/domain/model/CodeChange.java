package com.company.opsinvestigator.change.domain.model;

import java.time.Instant;
import java.util.UUID;

public record CodeChange(
        UUID id,
        String repository,
        Integer pullRequestNumber,
        String commitSha,
        String author,
        Instant mergedAt,
        String summary
) {
    public static CodeChange of(String repo, Integer prNum, String sha, String author, Instant mergedAt, String summary) {
        return new CodeChange(UUID.randomUUID(), repo, prNum, sha, author, mergedAt, summary);
    }
}
