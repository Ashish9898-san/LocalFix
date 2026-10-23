package com.localfix.service;

import com.localfix.dto.CreateReportRequest;
import com.localfix.dto.ReportResponse;
import com.localfix.dto.UpdateReportRequest;
import com.localfix.entity.Report;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;
import com.localfix.exception.ResourceNotFoundException;
import com.localfix.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ReportService
 *
 * Implements core business logic for civic issue reports.
 *
 * Concepts Explained:
 * 1. Service Layer Pattern: Sits between the HTTP Controller and the Database Repository.
 *    Controllers handle incoming HTTP details; Services handle business rules, validation,
 *    and entity mapping; Repositories handle database interactions.
 * 2. @Transactional: Ensures database operations inside a method execute within a transaction.
 *    If an exception occurs, changes are rolled back automatically.
 */
@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    /**
     * Retrieve all reports with optional category and status filtering.
     * Always returns records ordered newest first.
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports(ReportCategory category, ReportStatus status) {
        List<Report> reports;

        if (category != null && status != null) {
            reports = reportRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, status);
        } else if (category != null) {
            reports = reportRepository.findByCategoryOrderByCreatedAtDesc(category);
        } else if (status != null) {
            reports = reportRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            reports = reportRepository.findAllByOrderByCreatedAtDesc();
        }

        return reports.stream()
                .map(ReportResponse::fromEntity)
                .toList();
    }

    /**
     * Retrieve a single report by its unique ID.
     * Throws ResourceNotFoundException if the ID does not exist.
     */
    @Transactional(readOnly = true)
    public ReportResponse getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        return ReportResponse.fromEntity(report);
    }

    /**
     * Create and persist a new report.
     * Automatically applies PENDING status and backend timestamps.
     */
    @Transactional
    public ReportResponse createReport(CreateReportRequest request) {
        ReportSeverity severity = request.severity() != null ? request.severity() : ReportSeverity.MEDIUM;

        Report report = new Report(
                request.title().trim(),
                request.description().trim(),
                request.category(),
                severity,
                request.location().trim(),
                request.imageUrl()
        );

        Report saved = reportRepository.save(report);
        return ReportResponse.fromEntity(saved);
    }

    /**
     * Partially update an existing report (HTTP PATCH).
     * Modifies only the non-null fields provided in the request payload.
     * Protects 'id' and 'createdAt' from modification.
     */
    @Transactional
    public ReportResponse updateReport(Long id, UpdateReportRequest request) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));

        // Conditionally apply only the supplied non-null updates
        if (request.title() != null && !request.title().isBlank()) {
            report.setTitle(request.title().trim());
        }
        if (request.description() != null && !request.description().isBlank()) {
            report.setDescription(request.description().trim());
        }
        if (request.category() != null) {
            report.setCategory(request.category());
        }
        if (request.severity() != null) {
            report.setSeverity(request.severity());
        }
        if (request.location() != null && !request.location().isBlank()) {
            report.setLocation(request.location().trim());
        }
        if (request.status() != null) {
            report.setStatus(request.status());
        }
        if (request.imageUrl() != null) {
            report.setImageUrl(request.imageUrl());
        }

        Report updated = reportRepository.save(report);
        return ReportResponse.fromEntity(updated);
    }
}
