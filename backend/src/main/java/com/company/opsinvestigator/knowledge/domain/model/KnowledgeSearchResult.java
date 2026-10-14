package com.company.opsinvestigator.knowledge.domain.model;

public record KnowledgeSearchResult(
        String documentId,
        String chunkId,
        double score,
        String text,
        KnowledgeMetadata metadata
) {}
