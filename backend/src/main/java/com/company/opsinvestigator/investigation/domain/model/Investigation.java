package com.company.opsinvestigator.investigation.domain.model;

import java.time.Instant;
import java.util.UUID;

public class Investigation {

    private final UUID id;
    private final UUID incidentId;
    private String status;
    private String leadInvestigator;
    private final Instant startedAt;
    private Instant completedAt;
    private String summary;
    private Long version;

    public Investigation(UUID id,
                         UUID incidentId,
                         String status,
                         String leadInvestigator,
                         Instant startedAt,
                         Instant completedAt,
                         String summary,
                         Long version) {
        this.id = id;
        this.incidentId = incidentId;
        this.status = status;
        this.leadInvestigator = leadInvestigator;
        this.startedAt = startedAt != null ? startedAt : Instant.now();
        this.completedAt = completedAt;
        this.summary = summary;
        this.version = version == null ? 0L : version;
    }

    public static Investigation startForIncident(UUID incidentId, String leadInvestigator) {
        return new Investigation(
                UUID.randomUUID(),
                incidentId,
                "INITIALIZING",
                leadInvestigator,
                Instant.now(),
                null,
                "Automated investigation dossier initialization initiated.",
                0L
        );
    }

    public void complete(String summary) {
        this.status = "COMPLETED";
        this.completedAt = Instant.now();
        this.summary = summary;
    }

    public UUID getId() { return id; }
    public UUID getIncidentId() { return incidentId; }
    public String getStatus() { return status; }
    public String getLeadInvestigator() { return leadInvestigator; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public String getSummary() { return summary; }
    public Long getVersion() { return version; }
}
