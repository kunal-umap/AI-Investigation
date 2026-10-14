package com.company.opsinvestigator.common.event;

public interface EventPublisher {
    void publish(String topic, DomainEvent event);
}
