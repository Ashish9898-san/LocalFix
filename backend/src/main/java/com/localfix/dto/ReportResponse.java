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
    Instant updatedAt
) {
    /**
     * Maps a JPA Report entity to an immutable ReportResponse DTO.
     */
    public static ReportResponse fromEntity(Report report) {
        if (report == null) return null;
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
            report.getUpdatedAt()
        );
    }
}
