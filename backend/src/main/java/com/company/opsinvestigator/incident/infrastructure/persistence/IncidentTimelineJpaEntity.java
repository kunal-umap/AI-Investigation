package com.company.opsinvestigator.incident.infrastructure.persistence;

import com.company.opsinvestigator.incident.domain.model.IncidentTimelineEntry;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incident_timeline_entries")
public class IncidentTimelineJpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "entry_type", nullable = false, length = 64)
    private String entryType;

    @Column(name = "summary", nullable = false, length = 255)
    private String summary;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "source_ref", length = 255)
    private String sourceRef;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public IncidentTimelineJpaEntity() {}

    public static IncidentTimelineJpaEntity fromDomain(IncidentTimelineEntry entry) {
        IncidentTimelineJpaEntity entity = new IncidentTimelineJpaEntity();
        entity.id = entry.id();
        entity.incidentId = entry.incidentId();
        entity.timestamp = entry.timestamp();
        entity.entryType = entry.entryType();
        entity.summary = entry.summary();
        entity.description = entry.description();
        entity.sourceRef = entry.sourceRef();
        entity.createdAt = entry.createdAt();
        return entity;
    }

    public IncidentTimelineEntry toDomain() {
        return new IncidentTimelineEntry(
                this.id,
                this.incidentId,
                this.timestamp,
                this.entryType,
                this.summary,
                this.description,
                this.sourceRef,
                this.createdAt
        );
    }

    public UUID getId() { return id; }
    public UUID getIncidentId() { return incidentId; }
    public Instant getTimestamp() { return timestamp; }
    public String getEntryType() { return entryType; }
    public String getSummary() { return summary; }
    public String getDescription() { return description; }
    public String getSourceRef() { return sourceRef; }
    public Instant getCreatedAt() { return createdAt; }
}
