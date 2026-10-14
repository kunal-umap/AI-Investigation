package com.company.opsinvestigator.change.infrastructure.persistence;

import com.company.opsinvestigator.change.application.port.ChangeQueryPort;
import com.company.opsinvestigator.change.domain.model.CodeChange;
import com.company.opsinvestigator.change.domain.model.ConfigurationChange;
import com.company.opsinvestigator.change.domain.model.DeploymentEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Component
public class PostgresChangeQueryAdapter implements ChangeQueryPort {

    @Override
    public List<DeploymentEvent> findDeployments(String serviceName, String environment, Instant start, Instant end) {
        return Collections.emptyList();
    }

    @Override
    public List<ConfigurationChange> findConfigChanges(String serviceName, String environment, Instant start, Instant end) {
        return Collections.emptyList();
    }

    @Override
    public List<CodeChange> findRecentCodeChanges(String repository, Instant start, Instant end) {
        return Collections.emptyList();
    }
}
