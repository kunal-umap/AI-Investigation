package com.company.opsinvestigator.investigation.application.pipeline;

import com.company.opsinvestigator.change.application.port.ChangeQueryPort;
import com.company.opsinvestigator.change.domain.model.DeploymentEvent;
import com.company.opsinvestigator.change.domain.model.ConfigurationChange;
import com.company.opsinvestigator.incident.domain.model.Incident;
import com.company.opsinvestigator.investigation.domain.model.AiRecentChange;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Retrieves deployments, commits, and configuration changes within a configurable time window.
 */
public class ChangeRetriever {

    private final ChangeQueryPort changeQueryPort;

    public ChangeRetriever(ChangeQueryPort changeQueryPort) {
        this.changeQueryPort = changeQueryPort;
    }

    public List<AiRecentChange> retrieveCandidateChanges(Incident incident, Duration window) {
        Instant end = incident.getCreatedAt();
        Instant start = end.minus(window);

        List<AiRecentChange> candidates = new ArrayList<>();

        if (changeQueryPort != null) {
            List<DeploymentEvent> deployments = changeQueryPort.findDeploymentsByService(incident.getService(), start, end);
            if (deployments != null) {
                for (DeploymentEvent dep : deployments) {
                    double proximity = Duration.between(dep.getTimestamp(), end).toMinutes();
                    candidates.add(new AiRecentChange(
                            dep.getId().toString(),
                            "DEPLOYMENT",
                            "Deployment of " + dep.getVersion() + " to " + dep.getEnvironment(),
                            dep.getTimestamp(),
                            dep.getService(),
                            dep.getService() + "-core",
                            proximity,
                            "Deployment occurred " + proximity + " min before anomaly detection; potential correlation without asserting causality.",
                            List.of()
                    ));
                }
            }

            List<ConfigurationChange> configs = changeQueryPort.findConfigurationChanges(incident.getService(), start, end);
            if (configs != null) {
                for (ConfigurationChange cfg : configs) {
                    double proximity = Duration.between(cfg.getTimestamp(), end).toMinutes();
                    candidates.add(new AiRecentChange(
                            cfg.getId().toString(),
                            "CONFIG_CHANGE",
                            "Config key '" + cfg.getKey() + "' changed in " + cfg.getEnvironment(),
                            cfg.getTimestamp(),
                            cfg.getService(),
                            "config-layer",
                            proximity,
                            "Config change occurred " + proximity + " min before incident detection; potential correlation without asserting causality.",
                            List.of()
                    ));
                }
            }
        }

        return candidates;
    }
}
