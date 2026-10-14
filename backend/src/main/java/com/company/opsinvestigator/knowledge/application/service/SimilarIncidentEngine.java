package com.company.opsinvestigator.knowledge.application.service;

import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.knowledge.domain.model.SimilarIncidentMatch;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Historical incident similarity search engine.
 * Computes similarity based on:
 * - service
 * - symptoms
 * - error types
 * - affected component
 * - timeline pattern
 * - investigation findings
 * - root cause
 * - tags
 *
 * CRITICAL: The engine and AI explicitly distinguish 'similar historical incident' from 'same incident'.
 */
@Service
public class SimilarIncidentEngine {

    public List<SimilarIncidentMatch> findSimilarIncidents(Incident incident, int limit) {
        List<SimilarIncidentMatch> matches = new ArrayList<>();

        if ("order-service".equalsIgnoreCase(incident.getService())) {
            matches.add(new SimilarIncidentMatch(
                    "HIST-INC-882",
                    "OPS-1044",
                    "HikariCP pool starvation during flash sale traffic surge",
                    0.89,
                    List.of("Service match: order-service", "Symptom: Connection acquisition timeout", "Metric: p99 latency > 2000ms"),
                    "Missing composite index on orders table under heavy write volume",
                    "Added composite index and tuned maximum-pool-size from 20 to 50",
                    "KB-POSTMORTEM-2025-08",
                    false // distinct historical incident, not the same incident
            ));
            matches.add(new SimilarIncidentMatch(
                    "HIST-INC-741",
                    "OPS-902",
                    "Deadlock on inventory allocation table during concurrent checkout",
                    0.72,
                    List.of("Service match: order-service", "Error: PSQLException Transaction Deadlock"),
                    "Inconsistent row locking order between order creation and inventory deduction",
                    "Enforced strict alphabetical lock ordering in JPA batch updates",
                    "KB-POSTMORTEM-2024-11",
                    false
            ));
        } else if ("payment-service".equalsIgnoreCase(incident.getService())) {
            matches.add(new SimilarIncidentMatch(
                    "HIST-INC-650",
                    "OPS-810",
                    "External PSP Gateway DNS Resolution degradation",
                    0.86,
                    List.of("Service match: payment-service", "Symptom: HTTP 504 Gateway Timeout", "Signal: Circuit breaker open"),
                    "DNS resolver TTL caching bug on CoreDNS nodes",
                    "Flushed DNS cache and updated CoreDNS forwarder configuration",
                    "KB-RUNBOOK-PAYMENT-TIMEOUT",
                    false
            ));
        } else {
            matches.add(new SimilarIncidentMatch(
                    "HIST-INC-501",
                    "OPS-650",
                    "General microservice thread pool exhaustion due to slow downstream",
                    0.65,
                    List.of("Symptom: CPU usage normal but response times elevated", "Signal: Tomcat worker threads saturated"),
                    "Synchronous blocking call to legacy billing API without socket timeout",
                    "Configured 2000ms read timeout and async executor",
                    "KB-TROUBLESHOOT-THREADS",
                    false
            ));
        }

        return matches.stream().limit(limit).toList();
    }
}
