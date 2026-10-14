package com.company.opsinvestigator.incident.api.dto;

import java.util.UUID;

public record IncidentResolutionRequest(
        String confirmedRootCause,
        String actualResolution,
        String affectedComponent,
        String lessonsLearned,
        String preventiveAction,
        String relatedRunbook
) {}
