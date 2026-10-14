package com.company.opsinvestigator.auth.domain.model;

import java.util.Set;
import java.util.UUID;

public record UserPrincipal(
        UUID userId,
        String username,
        String email,
        Set<Role> roles
) {}
