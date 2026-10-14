package com.company.opsinvestigator.change.application.port;

import com.company.opsinvestigator.change.domain.model.CodeChange;
import com.company.opsinvestigator.change.domain.model.ConfigurationChange;
import com.company.opsinvestigator.change.domain.model.DeploymentEvent;

import java.time.Instant;
import java.util.List;

public interface ChangeQueryPort {
    List<DeploymentEvent> findDeployments(String serviceName, String environment, Instant start, Instant end);
    List<ConfigurationChange> findConfigChanges(String serviceName, String environment, Instant start, Instant end);
    List<CodeChange> findRecentCodeChanges(String repository, Instant start, Instant end);
}
