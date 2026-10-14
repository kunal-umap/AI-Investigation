package com.company.opsinvestigator.knowledge.domain.model;

import java.util.Collections;
import java.util.List;

public record KnowledgeChunk(
        String chunkId,
        String documentId,
        int chunkIndex,
        String text,
        List<Double> embedding,
        KnowledgeMetadata metadata
) {
    public KnowledgeChunk {
        embedding = embedding == null ? Collections.emptyList() : List.copyOf(embedding);
    }
}
