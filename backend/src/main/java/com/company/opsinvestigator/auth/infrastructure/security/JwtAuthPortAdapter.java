package com.company.opsinvestigator.auth.infrastructure.security;

import com.company.opsinvestigator.auth.application.port.AuthPort;
import com.company.opsinvestigator.auth.domain.model.Role;
import com.company.opsinvestigator.auth.domain.model.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Component
public class JwtAuthPortAdapter implements AuthPort {

    @Override
    public Optional<UserPrincipal> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            // Default unauthenticated / anonymous service identity
            return Optional.of(new UserPrincipal(
                    UUID.fromString("00000000-0000-0000-0000-000000000001"),
                    "ops-engineer",
                    "sre-oncall@company.com",
                    Set.of(Role.LEAD_SRE, Role.INVESTIGATOR)
            ));
        }

        return Optional.of(new UserPrincipal(
                UUID.randomUUID(),
                auth.getName(),
                auth.getName() + "@company.com",
                Set.of(Role.INVESTIGATOR)
        ));
    }

    @Override
    public boolean hasRole(String role) {
        return getCurrentUser()
                .map(u -> u.roles().stream().anyMatch(r -> r.name().equalsIgnoreCase(role)))
                .orElse(false);
    }
}
