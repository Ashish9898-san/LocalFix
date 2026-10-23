package com.localfix.dto;

import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * CreateReportRequest DTO
 *
 * Encapsulates the JSON payload required to submit a new problem report.
 * Uses Jakarta Bean Validation annotations to enforce input constraints.
 */
public record CreateReportRequest(
    @NotBlank(message = "Title is required and cannot be empty")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    String title,

    @NotBlank(message = "Description is required and cannot be empty")
    @Size(min = 15, max = 3000, message = "Description must be between 15 and 3000 characters")
    String description,

    @NotNull(message = "Category is required (e.g. ROADS, GARBAGE, STREETLIGHTS, WATER_LEAKAGE, PUBLIC_PROPERTY, OTHER)")
    ReportCategory category,

    ReportSeverity severity,

    @NotBlank(message = "Location is required and cannot be empty")
    @Size(min = 4, max = 255, message = "Location must be between 4 and 255 characters")
    String location,

    String imageUrl
) {}
