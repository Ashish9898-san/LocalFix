package com.localfix.dto;

/**
 * ImageUploadResponse DTO
 *
 * Represents the JSON payload returned upon successful image upload.
 * Provides the accessible relative URL and metadata for the saved image.
 *
 * Concepts Explained for Beginners:
 * 1. Separation of Storage & Metadata: Instead of storing megabytes of raw image bytes
 *    inside a MySQL row, we store the file on disk and return a lightweight relative URL
 *    (e.g., "/api/reports/images/123e4567.jpg") to save in the database.
 * 2. Immutable Record: Java records provide concise, thread-safe data carriers with
 *    automatic getters, equals, and hashCode.
 */
public record ImageUploadResponse(
    String imageUrl,
    String fileName,
    long fileSize,
    String contentType
) {}
