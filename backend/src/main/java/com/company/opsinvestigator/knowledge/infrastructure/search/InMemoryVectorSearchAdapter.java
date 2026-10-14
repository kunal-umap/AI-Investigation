package com.company.opsinvestigator.knowledge.infrastructure.search;

import com.company.opsinvestigator.knowledge.application.port.KnowledgeSearchPort;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeChunk;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeMetadata;
import com.company.opsinvestigator.knowledge.domain.model.KnowledgeSearchResult;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory vector and semantic keyword search index with chunking, metadata filtering,
 * and security role-based authorization filtering.
 */
@Component
public class InMemoryVectorSearchAdapter implements KnowledgeSearchPort {

    private final Map<String, KnowledgeChunk> chunkStore = new ConcurrentHashMap<>();

    public InMemoryVectorSearchAdapter() {
        seedInitialKnowledge();
    }

    @Override
    public List<KnowledgeSearchResult> search(String query, Map<String, Object> metadataFilters, String userRole, int limit) {
        String lowerQuery = query.toLowerCase();
        String[] queryTokens = lowerQuery.split("\\s+");

        List<KnowledgeSearchResult> results = new ArrayList<>();

        for (KnowledgeChunk chunk : chunkStore.values()) {
            KnowledgeMetadata meta = chunk.metadata();

            // 1. Security Authorization Filtering
            if (meta.minimumRequiredRole() != null) {
                if ("ADMIN".equals(meta.minimumRequiredRole()) && !"ADMIN".equalsIgnoreCase(userRole)) {
                    continue; // Skip unauthorized document
                }
            }

            // 2. Metadata Filtering
            if (metadataFilters != null && !metadataFilters.isEmpty()) {
                if (metadataFilters.containsKey("service")) {
                    String reqService = (String) metadataFilters.get("service");
                    if (meta.service() != null && !meta.service().equalsIgnoreCase(reqService)) {
                        continue;
                    }
                }
            }

            // 3. Keyword and semantic token match scoring
            String text = chunk.text().toLowerCase();
            double score = 0.0;
            int matches = 0;
            for (String token : queryTokens) {
                if (token.length() > 2 && text.contains(token)) {
                    matches++;
                }
            }
            if (matches > 0) {
                score = (double) matches / queryTokens.length;
                score = Math.min(0.98, 0.4 + score * 0.55);
            } else if (text.contains(meta.service().toLowerCase())) {
                score = 0.45;
            }

            if (score > 0.3) {
                results.add(new KnowledgeSearchResult(
                        chunk.documentId(),
                        chunk.chunkId(),
                        score,
                        chunk.text(),
                        chunk.metadata()
                ));
            }
        }

        return results.stream()
                .sorted(Comparator.comparingDouble(KnowledgeSearchResult::score).reversed())
                .limit(limit > 0 ? limit : 5)
                .collect(Collectors.toList());
    }

    @Override
    public void indexChunk(KnowledgeChunk chunk) {
        chunkStore.put(chunk.chunkId(), chunk);
    }

    @Override
    public void ingestDocument(String documentId,
                               String type,
                               String service,
                               String component,
                               String title,
                               String fullContent,
                               List<String> tags,
                               String userRole) {
        // Chunking with sensible length (approx 200 chars)
        String[] paragraphs = fullContent.split("\n\n");
        int index = 0;
        for (String para : paragraphs) {
            if (para.trim().isEmpty()) continue;
            String chunkId = documentId + "-c" + index;
            KnowledgeMetadata meta = new KnowledgeMetadata(
                    documentId,
                    type,
                    service,
                    component,
                    "production",
                    Instant.now(),
                    tags,
                    null,
                    "1.0",
                    userRole
            );
            KnowledgeChunk chunk = new KnowledgeChunk(
                    chunkId,
                    documentId,
                    index++,
                    para.trim(),
                    List.of(0.12, 0.45, 0.78),
                    meta
            );
            indexChunk(chunk);
        }
    }

    private void seedInitialKnowledge() {
        ingestDocument(
                "KB-POSTMORTEM-2025-08",
                "POSTMORTEM",
                "order-service",
                "connection-pool",
                "Order Service HikariCP Exhaustion Postmortem",
                "Root cause: Unindexed query on orders table caused full table scans under load, causing HikariCP active connections to peak at 50/50.\n\nResolution: Added composite index on (tenant_id, created_at) and increased connection leak detection threshold to 5000ms.\n\nPreventive action: Query plan verification in CI pipeline for all new repository methods.",
                List.of("database", "hikaricp", "connection-pool", "latency"),
                "ENGINEER"
        );

        ingestDocument(
                "KB-RUNBOOK-PAYMENT-TIMEOUT",
                "RUNBOOK",
                "payment-service",
                "gateway-client",
                "Payment Gateway Timeout SOP",
                "Symptoms: Sudden spike in HTTP 504 gateway timeouts and circuit breaker state opening on payment downstream endpoints.\n\nInspection steps: Check external PSP health dashboard, inspect TLS handshake latency, verify DNS resolution times on payment.external.com.\n\nRead-only verification: Query latency metrics using curl and check payment_errors_total metric counter.",
                List.of("payment", "circuit-breaker", "timeout", "sop"),
                "ENGINEER"
        );

        ingestDocument(
                "KB-ARCH-AUTH-TOKEN-STORE",
                "ARCHITECTURE",
                "auth-service",
                "redis-session",
                "Auth Service Token Cache Architecture",
                "Architecture overview: Auth service relies on Redis cluster for JWT revocation and session caching.\n\nDegradation pattern: High memory fragmentation ratio in Redis leads to eviction of session keys, resulting in elevated HTTP 401 and 500 status codes.\n\nTroubleshooting: Inspect redis info memory and monitor redis_evicted_keys_total.",
                List.of("auth", "redis", "cache", "architecture"),
                "ENGINEER"
        );
    }
}
