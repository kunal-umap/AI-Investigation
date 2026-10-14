package com.company.opsinvestigator.auth.application.port;

import com.company.opsinvestigator.auth.domain.model.UserPrincipal;

import java.util.Optional;

public interface AuthPort {
    Optional<UserPrincipal> getCurrentUser();
    boolean hasRole(String role);
}
