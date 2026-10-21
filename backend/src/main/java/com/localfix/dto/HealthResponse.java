package com.localfix.dto;

import java.time.Instant;

/**
 * HealthResponse DTO (Data Transfer Object)
 *
 * Represents the structured JSON payload returned by the health check endpoint.
 * In modern Java (Java 16+ and Java 21), a "record" is a concise way to create
 * an immutable data-carrying class with automatic getters, equals, hashCode, and toString.
 */
public record HealthResponse(
    String application,
    String status,
    String message,
    String timestamp
) {
    /**
     * Convenience factory method to construct a default UP health response
     */
    public static HealthResponse up() {
        return new HealthResponse(
            "LocalFix",
            "UP",
            "LocalFix backend is running",
            Instant.now().toString()
        );
    }
}
