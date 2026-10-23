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
}
