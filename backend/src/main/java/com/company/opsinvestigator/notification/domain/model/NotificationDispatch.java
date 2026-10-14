package com.company.opsinvestigator.notification.domain.model;

import java.time.Instant;
import java.util.UUID;

public record NotificationDispatch(
        UUID id,
        String channel,
        String recipient,
        String subject,
        String messageBody,
        String status,
        Instant dispatchedAt
) {
    public static NotificationDispatch of(String channel, String recipient, String subject, String body) {
        return new NotificationDispatch(UUID.randomUUID(), channel, recipient, subject, body, "SENT", Instant.now());
    }
}
