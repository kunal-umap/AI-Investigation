package com.company.opsinvestigator.notification.application.port;

import com.company.opsinvestigator.notification.domain.model.NotificationDispatch;

public interface NotificationPort {
    NotificationDispatch sendNotification(String channel, String recipient, String subject, String body);
}
