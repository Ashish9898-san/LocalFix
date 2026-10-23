package com.localfix.dto;

import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;
import jakarta.validation.constraints.Size;

/**
 * UpdateReportRequest DTO
 *
 * Encapsulates the optional fields for partially updating an existing report via HTTP PATCH.
 * All fields are optional; only non-null fields provided by the client will be modified.
 * Notice: 'id' and 'createdAt' are deliberately omitted to prevent unauthorized tampering.
 */
public record UpdateReportRequest(
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    String title,

    @Size(min = 15, max = 3000, message = "Description must be between 15 and 3000 characters")
    String description,

    ReportCategory category,

    ReportSeverity severity,

    @Size(min = 4, max = 255, message = "Location must be between 4 and 255 characters")
    String location,

    ReportStatus status,

    String imageUrl
) {}
