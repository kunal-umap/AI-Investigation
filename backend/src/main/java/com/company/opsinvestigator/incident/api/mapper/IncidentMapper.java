package com.company.opsinvestigator.incident.api.mapper;

import com.company.opsinvestigator.incident.api.dto.IncidentEvidenceResponse;
import com.company.opsinvestigator.incident.api.dto.IncidentResponse;
import com.company.opsinvestigator.incident.api.dto.IncidentTimelineEntryResponse;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.incident.domain.model.IncidentEvidence;
import com.company.opsinvestigator.incident.domain.model.IncidentTimelineEntry;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper {

    public IncidentResponse toResponse(Incident domain) {
        if (domain == null) return null;
        return new IncidentResponse(
                domain.getId(),
                domain.getIncidentKey(),
                domain.getTitle(),
                domain.getDescription(),
                domain.getStatus(),
                domain.getSeverity(),
                domain.getEnvironment(),
                domain.getServiceName(),
                domain.getDetectedAt(),
                domain.getStartedAt(),
                domain.getResolvedAt(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getVersion()
        );
    }

    public IncidentTimelineEntryResponse toTimelineResponse(IncidentTimelineEntry entry) {
        if (entry == null) return null;
        return new IncidentTimelineEntryResponse(
                entry.id(),
                entry.incidentId(),
                entry.timestamp(),
                entry.entryType(),
                entry.summary(),
                entry.description(),
                entry.sourceRef(),
                entry.createdAt()
        );
    }

    public IncidentEvidenceResponse toEvidenceResponse(IncidentEvidence evidence) {
        if (evidence == null) return null;
        return new IncidentEvidenceResponse(
                evidence.id(),
                evidence.incidentId(),
                evidence.evidenceId(),
                evidence.relationType(),
                evidence.relevanceScore(),
                evidence.notes(),
                evidence.linkedAt()
        );
    }
}
