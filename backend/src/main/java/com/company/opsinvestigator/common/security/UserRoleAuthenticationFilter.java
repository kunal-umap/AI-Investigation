package com.company.opsinvestigator.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class UserRoleAuthenticationFilter extends OncePerRequestFilter {

    public static final String ROLE_HEADER = "X-User-Role";
    public static final String USER_HEADER = "X-User-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String roleHeader = request.getHeader(ROLE_HEADER);
        String userHeader = request.getHeader(USER_HEADER);

        String role = (roleHeader != null && !roleHeader.isBlank())
                ? roleHeader.toUpperCase().trim()
                : "ENGINEER";

        String user = (userHeader != null && !userHeader.isBlank())
                ? userHeader.trim()
                : "sre-engineer";

        // Validate allowed roles
        if (!role.equals("ADMIN") && !role.equals("ENGINEER") && !role.equals("VIEWER")) {
            role = "VIEWER";
        }

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user,
                null,
                List.of(authority)
        );

        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}
