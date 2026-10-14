package com.company.opsinvestigator.notification.infrastructure.integration;

import com.company.opsinvestigator.notification.application.port.NotificationPort;
import com.company.opsinvestigator.notification.domain.model.NotificationDispatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NotificationPortAdapter implements NotificationPort {

    private static final Logger log = LoggerFactory.getLogger(NotificationPortAdapter.class);

    @Override
    public NotificationDispatch sendNotification(String channel, String recipient, String subject, String body) {
        log.info("Dispatching incident notification to channel [{}] recipient [{}] subject [{}]", channel, recipient, subject);
        return NotificationDispatch.of(channel, recipient, subject, body);
    }
}
