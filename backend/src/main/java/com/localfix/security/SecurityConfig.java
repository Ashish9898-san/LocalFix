package com.localfix.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfix.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig
 *
 * Central Spring Security 6 Configuration for LocalFix.
 *
 * Concepts Explained for Beginners:
 * 1. Stateless Architecture: Disables server-side HTTP sessions in favor of JWT authentication tokens.
 * 2. Role-Based Access Control (RBAC):
 *    - Anonymous visitors can browse public reports and submit authentication requests.
 *    - Authenticated citizens can submit new reports, upload evidence images, and view their own reports.
 *    - Administrators (ROLE_ADMIN) can review, triage, and update report statuses.
 * 3. CSRF Protection: Disabled because JWT REST APIs are inherently stateless and not vulnerable to cookie-based CSRF.
 * 4. Error Handling: Uses custom AuthenticationEntryPoint (401) and AccessDeniedHandler (403) to return
 *    clean, structured JSON ErrorResponse objects instead of Spring's default HTML error pages.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper;

    public SecurityConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. CORS Preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Public Community & Documentation Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/reports", "/api/reports/{id:[0-9]+}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reports/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()

                        // 3. Authenticated Citizen & General Mutating Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/auth/me", "/api/reports/my").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/reports", "/api/reports/images").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/reports/**").authenticated()

                        // 4. Administrator Only Endpoints
                        .requestMatchers(HttpMethod.PATCH, "/api/reports/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reports/**").hasRole("ADMIN")

                        // 5. Default catch-all
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            ErrorResponse error = ErrorResponse.of(
                                    HttpStatus.UNAUTHORIZED.value(),
                                    HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                                    "Full authentication is required to access this resource. Please log in.",
                                    request.getRequestURI()
                            );
                            response.getWriter().write(objectMapper.writeValueAsString(error));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            ErrorResponse error = ErrorResponse.of(
                                    HttpStatus.FORBIDDEN.value(),
                                    HttpStatus.FORBIDDEN.getReasonPhrase(),
                                    "Access Denied: You do not have permission to access this resource (Administrator privileges required).",
                                    request.getRequestURI()
                            );
                            response.getWriter().write(objectMapper.writeValueAsString(error));
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Location"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
