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
import com.localfix.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReportService using Mockito.
 * Isolates business logic without starting a database or web server.
 */
@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ReportService reportService;

    // Helper method to set private generated fields (id, timestamps) for mock entities
    private Report createSampleEntity(Long id, String title, ReportCategory category,
                                     ReportSeverity severity, ReportStatus status,
                                     String location, String imageUrl) {
        Report report = new Report(title, "Detailed description for " + title, category, severity, location, imageUrl);
        report.setStatus(status);
        try {
            Field idField = Report.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(report, id);

            Field createdAtField = Report.class.getDeclaredField("createdAt");
            createdAtField.setAccessible(true);
            createdAtField.set(report, Instant.now());

            Field updatedAtField = Report.class.getDeclaredField("updatedAt");
            updatedAtField.setAccessible(true);
            updatedAtField.set(report, Instant.now());
        } catch (Exception e) {
            throw new RuntimeException("Failed to set entity reflection fields", e);
        }
        return report;
    }

    @Test
    @DisplayName("getAllReports without filters retrieves all reports ordered newest first")
    void getAllReports_noFilters() {
        Report r1 = createSampleEntity(1L, "Pothole on Main St", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.PENDING, "123 Main St", null);
        Report r2 = createSampleEntity(2L, "Broken streetlight", ReportCategory.STREETLIGHTS, ReportSeverity.LOW, ReportStatus.RESOLVED, "456 Elm St", null);

        when(reportRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(r1, r2));

        List<ReportResponse> result = reportService.getAllReports(null, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).title()).isEqualTo("Pothole on Main St");
        assertThat(result.get(1).title()).isEqualTo("Broken streetlight");
        verify(reportRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("getAllReports with category filter queries repository findByCategory")
    void getAllReports_withCategoryFilter() {
        Report r1 = createSampleEntity(1L, "Pothole", ReportCategory.ROADS, ReportSeverity.MEDIUM, ReportStatus.PENDING, "123 Main St", null);
        when(reportRepository.findByCategoryOrderByCreatedAtDesc(ReportCategory.ROADS)).thenReturn(List.of(r1));

        List<ReportResponse> result = reportService.getAllReports(ReportCategory.ROADS, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).category()).isEqualTo(ReportCategory.ROADS);
        verify(reportRepository, times(1)).findByCategoryOrderByCreatedAtDesc(ReportCategory.ROADS);
    }

    @Test
    @DisplayName("getAllReports with status filter queries repository findByStatus")
    void getAllReports_withStatusFilter() {
        Report r1 = createSampleEntity(1L, "Pothole", ReportCategory.ROADS, ReportSeverity.MEDIUM, ReportStatus.IN_PROGRESS, "123 Main St", null);
        when(reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.IN_PROGRESS)).thenReturn(List.of(r1));

        List<ReportResponse> result = reportService.getAllReports(null, ReportStatus.IN_PROGRESS);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo(ReportStatus.IN_PROGRESS);
        verify(reportRepository, times(1)).findByStatusOrderByCreatedAtDesc(ReportStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("getAllReports with category and status queries repository findByCategoryAndStatus")
    void getAllReports_withBothFilters() {
        Report r1 = createSampleEntity(1L, "Pothole", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.RESOLVED, "123 Main St", null);
        when(reportRepository.findByCategoryAndStatusOrderByCreatedAtDesc(ReportCategory.ROADS, ReportStatus.RESOLVED))
                .thenReturn(List.of(r1));

        List<ReportResponse> result = reportService.getAllReports(ReportCategory.ROADS, ReportStatus.RESOLVED);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).category()).isEqualTo(ReportCategory.ROADS);
        assertThat(result.get(0).status()).isEqualTo(ReportStatus.RESOLVED);
        verify(reportRepository, times(1)).findByCategoryAndStatusOrderByCreatedAtDesc(ReportCategory.ROADS, ReportStatus.RESOLVED);
    }

    @Test
    @DisplayName("getReportById when report exists returns mapped DTO")
    void getReportById_found() {
        Report report = createSampleEntity(10L, "Water pipe leak", ReportCategory.WATER_LEAKAGE, ReportSeverity.HIGH, ReportStatus.PENDING, "Crossroads", null);
        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));

        ReportResponse response = reportService.getReportById(10L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.title()).isEqualTo("Water pipe leak");
        assertThat(response.category()).isEqualTo(ReportCategory.WATER_LEAKAGE);
        verify(reportRepository, times(1)).findById(10L);
    }

    @Test
    @DisplayName("getReportById when report not found throws ResourceNotFoundException")
    void getReportById_notFound() {
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reportService.getReportById(999L));
        verify(reportRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("createReport sets default MEDIUM severity when null and assigns PENDING status")
    void createReport_defaultSeverity() {
        CreateReportRequest request = new CreateReportRequest(
                "Garbage overflow",
                "Community bin overflowing at market corner",
                ReportCategory.GARBAGE,
                null, // severity omitted -> should default to MEDIUM
                "Corner of Market St",
                "https://example.com/bin.jpg"
        );

        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> {
            Report r = invocation.getArgument(0);
            return createSampleEntity(1L, r.getTitle(), r.getCategory(), r.getSeverity(), r.getStatus(), r.getLocation(), r.getImageUrl());
        });

        ReportResponse response = reportService.createReport(request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Garbage overflow");
        assertThat(response.severity()).isEqualTo(ReportSeverity.MEDIUM);
        assertThat(response.status()).isEqualTo(ReportStatus.PENDING);

        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(captor.capture());
        assertThat(captor.getValue().getSeverity()).isEqualTo(ReportSeverity.MEDIUM);
        assertThat(captor.getValue().getStatus()).isEqualTo(ReportStatus.PENDING);
    }

    @Test
    @DisplayName("createReport preserves specified severity when provided")
    void createReport_customSeverity() {
        CreateReportRequest request = new CreateReportRequest(
                "Dangerous downed wire",
                "Power wire sparking on sidewalk",
                ReportCategory.OTHER,
                ReportSeverity.HIGH,
                "North Ave",
                null
        );

        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> {
            Report r = invocation.getArgument(0);
            return createSampleEntity(2L, r.getTitle(), r.getCategory(), r.getSeverity(), r.getStatus(), r.getLocation(), r.getImageUrl());
        });

        ReportResponse response = reportService.createReport(request);

        assertThat(response.severity()).isEqualTo(ReportSeverity.HIGH);
    }

    @Test
    @DisplayName("createReport handles large base64 image strings without errors")
    void createReport_withLargeBase64Image() {
        String largeBase64 = "data:image/png;base64," + "B".repeat(100000);
        CreateReportRequest request = new CreateReportRequest(
                "Pothole with photo attachment",
                "Large pothole photographed from car dashboard",
                ReportCategory.ROADS,
                ReportSeverity.MEDIUM,
                "Oak Street & 2nd Ave",
                largeBase64
        );

        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> {
            Report r = invocation.getArgument(0);
            return createSampleEntity(3L, r.getTitle(), r.getCategory(), r.getSeverity(), r.getStatus(), r.getLocation(), r.getImageUrl());
        });

        ReportResponse response = reportService.createReport(request);

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.imageUrl()).isEqualTo(largeBase64);
        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(captor.capture());
        assertThat(captor.getValue().getImageUrl()).isEqualTo(largeBase64);
        assertThat(captor.getValue().getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("updateReport selectively updates non-null fields and preserves others")
    void updateReport_partialUpdate() {
        Report existing = createSampleEntity(5L, "Old Title", ReportCategory.ROADS, ReportSeverity.LOW, ReportStatus.PENDING, "Old Location", "https://old.com/pic.jpg");
        when(reportRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Update status and severity only
        UpdateReportRequest request = new UpdateReportRequest(
                null,
                null,
                null,
                ReportSeverity.HIGH,
                null,
                ReportStatus.IN_PROGRESS,
                null
        );

        ReportResponse updated = reportService.updateReport(5L, request);

        assertThat(updated.id()).isEqualTo(5L);
        assertThat(updated.title()).isEqualTo("Old Title"); // Preserved
        assertThat(updated.location()).isEqualTo("Old Location"); // Preserved
        assertThat(updated.severity()).isEqualTo(ReportSeverity.HIGH); // Updated
        assertThat(updated.status()).isEqualTo(ReportStatus.IN_PROGRESS); // Updated
        verify(reportRepository).save(existing);
    }

    @Test
    @DisplayName("updateReport throws ResourceNotFoundException if report ID does not exist")
    void updateReport_notFound() {
        when(reportRepository.findById(404L)).thenReturn(Optional.empty());

        UpdateReportRequest request = new UpdateReportRequest("New Title", null, null, null, null, null, null);

        assertThrows(ResourceNotFoundException.class, () -> reportService.updateReport(404L, request));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    @DisplayName("updateReport permits valid status transition PENDING -> RESOLVED")
    void updateReport_transition_pendingToResolved() {
        Report existing = createSampleEntity(10L, "Streetlight", ReportCategory.STREETLIGHTS, ReportSeverity.LOW, ReportStatus.PENDING, "5th Ave", null);
        when(reportRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateReportRequest request = new UpdateReportRequest(null, null, null, null, null, ReportStatus.RESOLVED, null);
        ReportResponse updated = reportService.updateReport(10L, request);

        assertThat(updated.status()).isEqualTo(ReportStatus.RESOLVED);
    }

    @Test
    @DisplayName("updateReport permits valid reopening transition RESOLVED -> IN_PROGRESS")
    void updateReport_transition_resolvedToInProgress_reopen() {
        Report existing = createSampleEntity(11L, "Water pipe", ReportCategory.WATER_LEAKAGE, ReportSeverity.HIGH, ReportStatus.RESOLVED, "Main St", null);
        when(reportRepository.findById(11L)).thenReturn(Optional.of(existing));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateReportRequest request = new UpdateReportRequest(null, null, null, null, null, ReportStatus.IN_PROGRESS, null);
        ReportResponse updated = reportService.updateReport(11L, request);

        assertThat(updated.status()).isEqualTo(ReportStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("updateReport rejects invalid transition RESOLVED -> PENDING with IllegalStateException")
    void updateReport_invalidTransition_resolvedToPending_throwsException() {
        Report existing = createSampleEntity(12L, "Garbage", ReportCategory.GARBAGE, ReportSeverity.MEDIUM, ReportStatus.RESOLVED, "Oak Lane", null);
        when(reportRepository.findById(12L)).thenReturn(Optional.of(existing));

        UpdateReportRequest request = new UpdateReportRequest(null, null, null, null, null, ReportStatus.PENDING, null);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> reportService.updateReport(12L, request));
        assertThat(ex.getMessage()).contains("Invalid status transition");
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    @DisplayName("createReport with user email associates report with authenticated user")
    void createReport_withUser_associatesReporter() {
        com.localfix.entity.User user = new com.localfix.entity.User(
                "Jane Doe", "jane@example.com", "hash", com.localfix.entity.UserRole.USER
        );
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateReportRequest request = new CreateReportRequest(
                "Broken Light", "Streetlight is out", ReportCategory.STREETLIGHTS,
                ReportSeverity.MEDIUM, "Pine Rd", null
        );

        ReportResponse response = reportService.createReport(request, "jane@example.com");

        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo("Broken Light");
        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(captor.capture());
        assertThat(captor.getValue().getReporter()).isEqualTo(user);
    }

    @Test
    @DisplayName("getMyReports retrieves reports for authenticated user ordered newest first")
    void getMyReports_success() {
        com.localfix.entity.User user = new com.localfix.entity.User(
                "Jane Doe", "jane@example.com", "hash", com.localfix.entity.UserRole.USER
        );
        Report r1 = createSampleEntity(21L, "Pothole", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.PENDING, "5th St", null);
        r1.setReporter(user);

        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(reportRepository.findByReporterOrderByCreatedAtDesc(user)).thenReturn(List.of(r1));

        List<ReportResponse> results = reportService.getMyReports("jane@example.com");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).title()).isEqualTo("Pothole");
        assertThat(results.get(0).reporterName()).isEqualTo("Jane Doe");
    }

    @Test
    @DisplayName("deleteReport as owner deletes report and calls fileStorageService to clean image")
    void deleteReport_asOwner_success() {
        com.localfix.entity.User owner = new com.localfix.entity.User(
                "Jane Doe", "jane@example.com", "hash", com.localfix.entity.UserRole.USER
        );
        Report report = createSampleEntity(10L, "Pothole", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.PENDING, "5th Ave", "/api/reports/images/sample.jpg");
        report.setReporter(owner);

        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));

        reportService.deleteReport(10L, "jane@example.com", false);

        verify(fileStorageService).deleteImageFile("/api/reports/images/sample.jpg");
        verify(reportRepository).delete(report);
    }

    @Test
    @DisplayName("deleteReport as admin deletes any report regardless of ownership")
    void deleteReport_asAdmin_success() {
        com.localfix.entity.User owner = new com.localfix.entity.User(
                "Other User", "other@example.com", "hash", com.localfix.entity.UserRole.USER
        );
        Report report = createSampleEntity(11L, "Broken Glass", ReportCategory.OTHER, ReportSeverity.LOW, ReportStatus.PENDING, "Park St", null);
        report.setReporter(owner);

        when(reportRepository.findById(11L)).thenReturn(Optional.of(report));

        reportService.deleteReport(11L, "admin@localfix.org", true);

        verify(reportRepository).delete(report);
    }

    @Test
    @DisplayName("deleteReport as non-owner throws AccessDeniedException and does not delete")
    void deleteReport_asNonOwner_throwsAccessDenied() {
        com.localfix.entity.User owner = new com.localfix.entity.User(
                "Real Owner", "owner@example.com", "hash", com.localfix.entity.UserRole.USER
        );
        Report report = createSampleEntity(12L, "Graffiti", ReportCategory.PUBLIC_PROPERTY, ReportSeverity.LOW, ReportStatus.PENDING, "Main St", null);
        report.setReporter(owner);

        when(reportRepository.findById(12L)).thenReturn(Optional.of(report));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                reportService.deleteReport(12L, "intruder@example.com", false)
        );

        verify(reportRepository, never()).delete(any());
        verify(fileStorageService, never()).deleteImageFile(any());
    }

    @Test
    @DisplayName("deleteReport with non-existent ID throws ResourceNotFoundException")
    void deleteReport_notFound_throwsException() {
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                reportService.deleteReport(999L, "jane@example.com", false)
        );

        verify(reportRepository, never()).delete(any());
    }
}
