package com.company.opsinvestigator.change.application.service;

import com.company.opsinvestigator.change.domain.model.ChangeGraph;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Dependency and change impact graph builder:
 * Models: Service, Component, Database, API, Deployment, Configuration, Incident
 * Relationships: DEPENDS_ON, CALLS, READS_FROM, WRITES_TO, DEPLOYED_WITH, AFFECTED_BY, CORRELATED_WITH
 */
@Service
public class ChangeImpactAnalyzer {

    public ChangeGraph buildDependencyGraphForService(String serviceName) {
        List<ChangeGraph.GraphNode> nodes = List.of(
                new ChangeGraph.GraphNode("svc-" + serviceName, serviceName, "SERVICE", Map.of("tier", "tier-1", "team", "Core Platform")),
                new ChangeGraph.GraphNode("comp-pool", "HikariCP-Pool", "COMPONENT", Map.of("maxConnections", "50")),
                new ChangeGraph.GraphNode("db-postgres", "PostgreSQL-Primary", "DATABASE", Map.of("engine", "Postgres-16", "host", "pg-cluster.internal")),
                new ChangeGraph.GraphNode("api-gateway", "Kong-API-Gateway", "API", Map.of("rateLimit", "10000rpm")),
                new ChangeGraph.GraphNode("dep-latest", "v2.4.1-rc3", "DEPLOYMENT", Map.of("status", "DEPLOYED", "author", "ci-pipeline")),
                new ChangeGraph.GraphNode("cfg-db", "spring.datasource.hikari", "CONFIGURATION", Map.of("leakDetectionThreshold", "2000")),
                new ChangeGraph.GraphNode("inc-active", "Active Anomaly", "INCIDENT", Map.of("state", "INVESTIGATING"))
        );

        List<ChangeGraph.GraphEdge> edges = List.of(
                new ChangeGraph.GraphEdge("api-gateway", "svc-" + serviceName, "CALLS"),
                new ChangeGraph.GraphEdge("svc-" + serviceName, "comp-pool", "DEPENDS_ON"),
                new ChangeGraph.GraphEdge("comp-pool", "db-postgres", "WRITES_TO"),
                new ChangeGraph.GraphEdge("comp-pool", "db-postgres", "READS_FROM"),
                new ChangeGraph.GraphEdge("dep-latest", "svc-" + serviceName, "DEPLOYED_WITH"),
                new ChangeGraph.GraphEdge("cfg-db", "comp-pool", "CORRELATED_WITH"),
                new ChangeGraph.GraphEdge("inc-active", "svc-" + serviceName, "AFFECTED_BY")
        );

        return new ChangeGraph(nodes, edges);
    }
}
