package com.company.opsinvestigator.knowledge.application.port;

import com.company.opsinvestigator.knowledge.domain.model.KnowledgeChunk;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeMetadata;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeSearchResult;

import java.util.List;
import java.util.Map;

/**
 * Port supporting semantic search, metadata filtering, and keyword search.
 * Enforces authorization filtering: AI may only retrieve documents the requesting user is authorized to access.
 */
public interface KnowledgeSearchPort {

    List<KnowledgeSearchResult> search(
            String query,
            Map<String, Object> metadataFilters,
            String userRole,
            int limit
    );

    void indexChunk(KnowledgeChunk chunk);

    void ingestDocument(
            String documentId,
            String type,
            String service,
            String component,
            String title,
            String fullContent,
            List<String> tags,
            String userRole
    );
}
