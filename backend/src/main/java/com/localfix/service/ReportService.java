package com.localfix.service;

import com.localfix.dto.CreateReportRequest;
import com.localfix.dto.ReportResponse;
import com.localfix.dto.UpdateReportRequest;
import com.localfix.entity.Report;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;
import com.localfix.exception.ResourceNotFoundException;
import com.localfix.entity.User;
import com.localfix.repository.ReportRepository;
import com.localfix.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository) {
        this(reportRepository, userRepository, null);
    }

    public ReportService(ReportRepository reportRepository, UserRepository userRepository, FileStorageService fileStorageService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
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
     * Retrieve reports submitted by the authenticated citizen (My Reports).
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        List<Report> reports = reportRepository.findByReporterOrderByCreatedAtDesc(user);
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
     * Create and persist a new report without an authenticated user (backward compatibility).
     */
    @Transactional
    public ReportResponse createReport(CreateReportRequest request) {
        return createReport(request, null);
    }

    /**
     * Create and persist a new report associated with an authenticated citizen.
     * Automatically applies PENDING status and backend timestamps.
     */
    @Transactional
    public ReportResponse createReport(CreateReportRequest request, String userEmail) {
        ReportSeverity severity = request.severity() != null ? request.severity() : ReportSeverity.MEDIUM;

        User reporter = null;
        if (userEmail != null && !userEmail.isBlank()) {
            reporter = userRepository.findByEmailIgnoreCase(userEmail.trim()).orElse(null);
        }

        Report report = new Report(
                request.title().trim(),
                request.description().trim(),
                request.category(),
                severity,
                request.location().trim(),
                request.imageUrl(),
                reporter
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
            if (!report.getStatus().canTransitionTo(request.status())) {
                throw new IllegalStateException(String.format(
                        "Invalid status transition: Report #%d cannot transition from [%s] to [%s]. " +
                        "A resolved report can only be reopened to [IN_PROGRESS].",
                        id, report.getStatus(), request.status()
                ));
            }
            report.setStatus(request.status());
            report.setUpdatedAt(java.time.Instant.now());
        }
        if (request.imageUrl() != null) {
            report.setImageUrl(request.imageUrl());
        }

        Report updated = reportRepository.save(report);
        return ReportResponse.fromEntity(updated);
    }

    /**
     * Delete an existing report with ownership or administrator role verification.
     * Also safely cleans up any associated image stored on disk.
     *
     * @param id the primary key of the report
     * @param currentUserEmail the authenticated user's email
     * @param isAdmin whether the authenticated user has ROLE_ADMIN
     */
    @Transactional
    public void deleteReport(Long id, String currentUserEmail, boolean isAdmin) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));

        // Authorization Rule: Administrators can delete any report; citizens can only delete their own
        if (!isAdmin) {
            if (report.getReporter() == null ||
                    currentUserEmail == null ||
                    !currentUserEmail.equalsIgnoreCase(report.getReporter().getEmail())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You do not have permission to delete this report. Citizens can only delete reports they personally submitted."
                );
            }
        }

        // Clean up photograph from filesystem if present
        if (report.getImageUrl() != null && fileStorageService != null) {
            fileStorageService.deleteImageFile(report.getImageUrl());
        }

        reportRepository.delete(report);
    }
}
