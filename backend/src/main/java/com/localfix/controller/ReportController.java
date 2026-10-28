package com.localfix.controller;

import com.localfix.dto.CreateReportRequest;
import com.localfix.dto.ImageUploadResponse;
import com.localfix.dto.ReportResponse;
import com.localfix.dto.UpdateReportRequest;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportStatus;
import com.localfix.service.FileStorageService;
import com.localfix.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * ReportController
 *
 * REST Controller exposing endpoints to create, retrieve, filter, partially update reports,
 * and handle civic photo uploads (Phase 8).
 * Base route: /api/reports
 *
 * Concepts Explained:
 * 1. @CrossOrigin: Enables browser frontend clients (React on port 5173) to call these APIs
 *    without being blocked by CORS (Cross-Origin Resource Sharing) browser policies.
 * 2. Multipart Uploads: Accepts multipart/form-data payloads carrying binary photo data.
 * 3. Controlled File Serving: Serves persistent photo files through HTTP GET with strict
 *    MIME-type enforcement, path traversal defense, and browser cache headers.
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReportController {

    private final ReportService reportService;
    private final FileStorageService fileStorageService;

    public ReportController(ReportService reportService, FileStorageService fileStorageService) {
        this.reportService = reportService;
        this.fileStorageService = fileStorageService;
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

    /**
     * POST /api/reports/images
     * Upload an issue photo attachment via multipart/form-data (Phase 8).
     * Validates file size (max 5 MB) and MIME types (JPEG, PNG, WebP, GIF).
     * Returns HTTP 201 Created with relative imageUrl and storage metadata.
     */
    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        ImageUploadResponse response = fileStorageService.storeImage(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/reports/images/{fileName}
     * Serves an uploaded civic report photograph.
     * Enforces path traversal protection and sends appropriate image Content-Type headers.
     */
    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadImageAsResource(fileName);
        String contentType = fileStorageService.probeContentType(fileName);
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }
}
