package com.company.opsinvestigator.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProblemDetails(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        Instant timestamp,
        String traceId,
        Map<String, String> invalidParams
) {
    public static ProblemDetails of(String type, String title, int status, String detail, String instance, String traceId) {
        return new ProblemDetails(
                type != null ? type : "about:blank",
                title,
                status,
                detail,
                instance,
                Instant.now(),
                traceId,
                null
        );
    }

    public static ProblemDetails withViolations(String type, String title, int status, String detail, String instance, String traceId, Map<String, String> invalidParams) {
        return new ProblemDetails(
                type != null ? type : "about:blank",
                title,
                status,
                detail,
                instance,
                Instant.now(),
                traceId,
                invalidParams
        );
    }
}
