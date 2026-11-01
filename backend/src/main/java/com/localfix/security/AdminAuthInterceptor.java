package com.localfix.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfix.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * AdminAuthInterceptor
 *
 * Enforces role-based authorization for administrative operations on the backend.
 *
 * Concepts Explained for Beginners:
 * 1. HandlerInterceptor: A Spring MVC middleware component that inspects incoming HTTP
 *    requests before they reach the @RestController method.
 * 2. Role-Based Access Control (RBAC): Differentiates between ordinary citizens
 *    (who can view and submit reports) and administrators (who can triage, update status,
 *    and manage reports).
 * 3. 403 Forbidden vs 401 Unauthorized:
 *    - 401 indicates authentication credentials are missing entirely.
 *    - 403 Forbidden indicates the caller does not possess the required administrator role.
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthInterceptor.class);

    public static final String ADMIN_ROLE_HEADER = "X-Admin-Role";
    public static final String ADMIN_ROLE_VALUE = "ADMIN";
    public static final String AUTH_HEADER = "Authorization";

    @Value("${localfix.admin.secret-key:localfix-admin-secret-2026}")
    private String adminSecretKey;

    private final ObjectMapper objectMapper;

    public AdminAuthInterceptor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Always allow CORS preflight requests (OPTIONS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Only enforce admin authorization on mutating administrative status methods (PATCH, PUT)
        // Public citizen methods and DELETE (which enforces citizen-ownership/admin checks in the service) are bypassed here.
        String method = request.getMethod();
        if (!"PATCH".equalsIgnoreCase(method) && !"PUT".equalsIgnoreCase(method)) {
            return true;
        }

        // Check for admin role header or bearer secret
        String adminRole = request.getHeader(ADMIN_ROLE_HEADER);
        String authHeader = request.getHeader(AUTH_HEADER);

        boolean isAuthorized = false;

        // 1. Check SecurityContext established by JwtAuthenticationFilter
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
            isAuthorized = true;
        } else if (adminRole != null && ADMIN_ROLE_VALUE.equalsIgnoreCase(adminRole.trim())) {
            isAuthorized = true;
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (adminSecretKey.equals(token) || "localfix-admin-token".equals(token)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            log.warn("Unauthorized administrative [{}] attempt on {} from IP {}",
                    method, request.getRequestURI(), request.getRemoteAddr());

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ErrorResponse errorResponse = ErrorResponse.of(
                    HttpStatus.FORBIDDEN.value(),
                    HttpStatus.FORBIDDEN.getReasonPhrase(),
                    "Access Denied: Administrator role credentials (X-Admin-Role: ADMIN) are required to perform this action.",
                    request.getRequestURI()
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return false;
        }

        return true;
    }
}
