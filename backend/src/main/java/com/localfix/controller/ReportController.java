package com.localfix.controller;

import com.localfix.dto.CreateReportRequest;
import com.localfix.dto.ReportResponse;
import com.localfix.dto.UpdateReportRequest;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportStatus;
import com.localfix.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * ReportController
 *
 * REST Controller exposing endpoints to create, retrieve, filter, and partially update reports.
 * Base route: /api/reports
 *
 * Concepts Explained:
 * 1. @CrossOrigin: Enables browser frontend clients (React on port 5173) to call these APIs
 *    without being blocked by CORS (Cross-Origin Resource Sharing) browser policies.
 * 2. @Valid: Triggers automatic Jakarta Bean Validation on incoming request bodies before
 *    the controller method executes.
 * 3. ResponseEntity.created(uri): Returns standard HTTP 201 Created status and sets the
 *    'Location' header pointing to the newly created resource (e.g. /api/reports/1).
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET /api/reports
     * Retrieves all reports, ordered newest first, with optional category/status filters.
     */
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports(
            @RequestParam(required = false) ReportCategory category,
            @RequestParam(required = false) ReportStatus status) {
        List<ReportResponse> reports = reportService.getAllReports(category, status);
        return ResponseEntity.ok(reports);
    }

    /**
     * GET /api/reports/{id}
     * Retrieves a single report by its primary key ID.
     * Returns 404 Not Found if no report exists with the given ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        ReportResponse report = reportService.getReportById(id);
        return ResponseEntity.ok(report);
    }

    /**
     * POST /api/reports
     * Validates and persists a new civic issue report.
     * Returns HTTP 201 Created with Location header and created report payload.
     */
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(@Valid @RequestBody CreateReportRequest request) {
        ReportResponse created = reportService.createReport(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    /**
     * PATCH /api/reports/{id}
     * Partially updates an existing report with only the fields provided in the body.
     * Returns HTTP 200 OK with updated report, or HTTP 404 if report does not exist.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportRequest request) {
        ReportResponse updated = reportService.updateReport(id, request);
        return ResponseEntity.ok(updated);
    }
}
