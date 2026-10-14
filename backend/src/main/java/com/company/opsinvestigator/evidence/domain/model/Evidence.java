package com.company.opsinvestigator.evidence.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Pure domain model representing investigated evidence metadata and storage pointers.
 * Raw log and payload bodies are stored externally in object storage; PostgreSQL stores references only.
 */
public class Evidence {

    private final UUID id;
    private final String type;
    private final String source;
    private final Instant timestamp;
    private final String referenceId;
    private final String summary;
    private final String rawReference;
    private final double relevanceScore;
    private final double confidence;
    private final String metadata;
    private final Instant createdAt;

    public Evidence(UUID id,
                    String type,
                    String source,
                    Instant timestamp,
                    String referenceId,
                    String summary,
                    String rawReference,
                    double relevanceScore,
                    double confidence,
                    String metadata,
                    Instant createdAt) {
        this.id = Objects.requireNonNull(id, "Evidence id must not be null");
        this.type = Objects.requireNonNull(type, "Type must not be null");
        this.source = Objects.requireNonNull(source, "Source must not be null");
        this.timestamp = Objects.requireNonNull(timestamp, "Timestamp must not be null");
        this.referenceId = Objects.requireNonNull(referenceId, "ReferenceId must not be null");
        this.summary = Objects.requireNonNull(summary, "Summary must not be null");
        this.rawReference = Objects.requireNonNull(rawReference, "RawReference must not be null");
        this.relevanceScore = relevanceScore;
        this.confidence = confidence;
        this.metadata = metadata;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static Evidence of(String type,
                              String source,
                              Instant timestamp,
                              String referenceId,
                              String summary,
                              String rawReference,
                              double relevanceScore,
                              double confidence,
                              String metadata) {
        return new Evidence(
                UUID.randomUUID(),
                type,
                source,
                timestamp,
                referenceId,
                summary,
                rawReference,
                relevanceScore,
                confidence,
                metadata,
                Instant.now()
        );
    }

    public UUID getId() { return id; }
    public String getType() { return type; }
    public String getSource() { return source; }
    public Instant getTimestamp() { return timestamp; }
    public String getReferenceId() { return referenceId; }
    public String getSummary() { return summary; }
    public String getRawReference() { return rawReference; }
    public double getRelevanceScore() { return relevanceScore; }
    public double getConfidence() { return confidence; }
    public String getMetadata() { return metadata; }
    public Instant getCreatedAt() { return createdAt; }
}
