package com.localfix.dto;

import com.localfix.entity.Report;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;

import java.time.Instant;

/**
 * ReportResponse DTO
 *
 * Represents the clean JSON payload returned to API consumers.
 * Keeps API contracts decoupled from internal JPA entity implementation details.
 * Exposes report ownership details (reporterId, reporterName) safely without private user credentials.
 */
public record ReportResponse(
    Long id,
    String title,
    String description,
    ReportCategory category,
    ReportSeverity severity,
    String location,
    ReportStatus status,
    String imageUrl,
    Instant createdAt,
    Instant updatedAt,
    Long reporterId,
    String reporterName
) {
    /**
     * Backward-compatible 10-parameter constructor for pre-existing tests.
     */
    public ReportResponse(Long id, String title, String description, ReportCategory category,
                          ReportSeverity severity, String location, ReportStatus status,
                          String imageUrl, Instant createdAt, Instant updatedAt) {
        this(id, title, description, category, severity, location, status, imageUrl, createdAt, updatedAt, null, null);
    }

    /**
     * Maps a JPA Report entity to an immutable ReportResponse DTO.
     */
    public static ReportResponse fromEntity(Report report) {
        if (report == null) return null;
        Long reporterId = report.getReporter() != null ? report.getReporter().getId() : null;
        String reporterName = report.getReporter() != null ? report.getReporter().getName() : null;

        return new ReportResponse(
            report.getId(),
            report.getTitle(),
            report.getDescription(),
            report.getCategory(),
            report.getSeverity(),
            report.getLocation(),
            report.getStatus(),
            report.getImageUrl(),
            report.getCreatedAt(),
            report.getUpdatedAt(),
            reporterId,
            reporterName
        );
    }
}
