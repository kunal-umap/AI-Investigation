package com.company.opsinvestigator.knowledge.domain.model;

import java.time.Instant;
import java.util.UUID;

public record KnowledgeDocument(
        UUID id,
        String title,
        String category,
        String contentRef,
        String tags,
        int version,
        Instant updatedAt
) {
    public static KnowledgeDocument create(String title, String category, String contentRef, String tags) {
        return new KnowledgeDocument(UUID.randomUUID(), title, category, contentRef, tags, 1, Instant.now());
    }
}
