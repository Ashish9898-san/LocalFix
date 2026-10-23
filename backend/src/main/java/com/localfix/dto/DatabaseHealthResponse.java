package com.localfix.dto;

import java.time.Instant;

/**
 * DatabaseHealthResponse DTO
 *
 * Represents the structured JSON payload returned by the database connectivity check endpoint.
 * Does not expose credentials, connection strings, or sensitive internal parameters.
 */
public record DatabaseHealthResponse(
    String database,
    String status,
    String message,
    long verifiedRecordCount,
    String timestamp
) {
    public static DatabaseHealthResponse up(long count) {
        return new DatabaseHealthResponse(
            "MySQL",
            "UP",
            "Database connection and query verified successfully",
            count,
            Instant.now().toString()
        );
    }

    public static DatabaseHealthResponse down(String safeMessage) {
        return new DatabaseHealthResponse(
            "MySQL",
            "DOWN",
            safeMessage,
            -1,
            Instant.now().toString()
        );
    }
}
