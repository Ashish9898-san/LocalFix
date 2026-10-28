package com.localfix.config;

import com.localfix.security.AdminAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig
 *
 * Global Spring MVC Web Configuration.
 * Configures Cross-Origin Resource Sharing (CORS) and registers administrative
 * authorization interceptors for all /api/** endpoints.
 *
 * Concepts Explained:
 * 1. CORS: Browsers enforce Same-Origin Policy. We allow http://localhost:5173
 *    to communicate with the Spring Boot server.
 * 2. Interceptors: Registered to inspect mutating requests and enforce admin-only access.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;

    public WebConfig(AdminAuthInterceptor adminAuthInterceptor) {
        this.adminAuthInterceptor = adminAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Enforce admin authorization on reports mutation endpoints
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/reports/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
