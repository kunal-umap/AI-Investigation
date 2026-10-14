package com.company.opsinvestigator.change.domain.model;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Lightweight dependency graph model:
 * Entities: Service, Component, Database, API, Deployment, Configuration, Incident
 * Relationships: DEPENDS_ON, CALLS, READS_FROM, WRITES_TO, DEPLOYED_WITH, AFFECTED_BY, CORRELATED_WITH
 */
public record ChangeGraph(
        List<GraphNode> nodes,
        List<GraphEdge> edges
) {
    public ChangeGraph {
        nodes = nodes == null ? Collections.emptyList() : List.copyOf(nodes);
        edges = edges == null ? Collections.emptyList() : List.copyOf(edges);
    }

    public record GraphNode(
            String id,
            String label,
            String type, // SERVICE, COMPONENT, DATABASE, API, DEPLOYMENT, CONFIGURATION, INCIDENT
            Map<String, String> attributes
    ) {}

    public record GraphEdge(
            String sourceId,
            String targetId,
            String relationship // DEPENDS_ON, CALLS, READS_FROM, WRITES_TO, DEPLOYED_WITH, AFFECTED_BY, CORRELATED_WITH
    ) {}
}
