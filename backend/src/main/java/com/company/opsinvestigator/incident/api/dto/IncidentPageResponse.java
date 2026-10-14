package com.company.opsinvestigator.incident.api.dto;

import java.util.List;

public record IncidentPageResponse(
        List<IncidentResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean isLast
) {
    public static IncidentPageResponse of(List<IncidentResponse> content, int page, int size, long totalElements) {
        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 1;
        boolean isLast = (page + 1) >= totalPages || totalPages == 0;
        return new IncidentPageResponse(content, page, size, totalElements, totalPages, isLast);
    }
}
