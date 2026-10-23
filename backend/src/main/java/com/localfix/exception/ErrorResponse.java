package com.localfix.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * ErrorResponse DTO
 *
 * Standardized, safe error representation returned to API clients.
 * Protects against leaking internal stack traces, database schema, or credentials.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> errors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ErrorResponse validation(int status, String error, String message, String path, Map<String, String> fieldErrors) {
        return new ErrorResponse(Instant.now(), status, error, message, path, fieldErrors);
    }
}
