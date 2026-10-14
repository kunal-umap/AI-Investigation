package com.company.opsinvestigator.common.infrastructure.event;

import com.company.opsinvestigator.common.event.DomainEvent;
import com.company.opsinvestigator.common.event.EventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class LoggingAndKafkaEventPublisher implements EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(LoggingAndKafkaEventPublisher.class);

    private final ApplicationEventPublisher applicationEventPublisher;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final boolean kafkaEnabled;

    public LoggingAndKafkaEventPublisher(
            ApplicationEventPublisher applicationEventPublisher,
            @Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${ops.kafka.enabled:true}") boolean kafkaEnabled) {
        this.applicationEventPublisher = applicationEventPublisher;
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaEnabled = kafkaEnabled;
    }

    @Override
    public void publish(String topic, DomainEvent event) {
        log.info("Publishing domain event [type={}] [aggregateId={}] [topic={}]",
                event.eventType(), event.aggregateId(), topic);

        // Always notify in-process Spring application listeners
        applicationEventPublisher.publishEvent(event);

        // Notify Kafka if configured and enabled
        if (kafkaEnabled && kafkaTemplate != null) {
            try {
                kafkaTemplate.send(topic, event.aggregateId(), event);
            } catch (Exception e) {
                log.warn("Failed sending domain event to Kafka topic {}: {}", topic, e.getMessage());
            }
        }
    }
}
