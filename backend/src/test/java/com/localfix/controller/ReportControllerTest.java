package com.localfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfix.config.WebConfig;
import com.localfix.dto.CreateReportRequest;
import com.localfix.dto.ImageUploadResponse;
import com.localfix.dto.ReportResponse;
import com.localfix.dto.UpdateReportRequest;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;
import com.localfix.exception.GlobalExceptionHandler;
import com.localfix.exception.ResourceNotFoundException;
import com.localfix.security.AdminAuthInterceptor;
import com.localfix.service.FileStorageService;
import com.localfix.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web Layer Slice Tests for ReportController using @WebMvcTest.
 * Focuses strictly on HTTP handling, JSON serialization, URL mappings,
 * Jakarta Bean Validation, and GlobalExceptionHandler behavior.
 * Does not initialize real database or Hikari connection pool.
 */
@WebMvcTest(ReportController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, WebConfig.class, AdminAuthInterceptor.class})
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportService reportService;

    @MockBean
    private FileStorageService fileStorageService;

    private ReportResponse sampleResponse(Long id, String title, ReportCategory category,
                                          ReportSeverity severity, ReportStatus status) {
        return new ReportResponse(
                id,
                title,
                "Detailed description of issue " + id,
                category,
                severity,
                "Corner of 5th Ave and Pine",
                status,
                "https://example.com/photo.jpg",
                Instant.now().minus(2, ChronoUnit.HOURS),
                Instant.now()
        );
    }

    @Test
    @DisplayName("GET /api/reports returns 200 OK and list of reports")
    void getAllReports_success() throws Exception {
        ReportResponse r1 = sampleResponse(1L, "Pothole on 5th", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.PENDING);
        ReportResponse r2 = sampleResponse(2L, "Garbage Overflow", ReportCategory.GARBAGE, ReportSeverity.MEDIUM, ReportStatus.IN_PROGRESS);

        when(reportService.getAllReports(null, null)).thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/api/reports")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Pothole on 5th"))
                .andExpect(jsonPath("$[0].category").value("ROADS"))
                .andExpect(jsonPath("$[0].severity").value("HIGH"))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    @DisplayName("GET /api/reports with filters passes query params to service")
    void getAllReports_withFilters() throws Exception {
        ReportResponse r1 = sampleResponse(1L, "Pothole", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.PENDING);
        when(reportService.getAllReports(ReportCategory.ROADS, ReportStatus.PENDING)).thenReturn(List.of(r1));

        mockMvc.perform(get("/api/reports")
                .param("category", "ROADS")
                .param("status", "PENDING")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].category").value("ROADS"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/reports/my returns list of reports submitted by authenticated user")
    void getMyReports_success() throws Exception {
        ReportResponse r1 = sampleResponse(1L, "My Pothole Report", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.PENDING);
        when(reportService.getMyReports(any())).thenReturn(List.of(r1));

        mockMvc.perform(get("/api/reports/my")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("My Pothole Report"));
    }

    @Test
    @DisplayName("GET /api/reports/{id} returns 200 OK when found")
    void getReportById_found() throws Exception {
        ReportResponse r1 = sampleResponse(10L, "Broken Streetlight", ReportCategory.STREETLIGHTS, ReportSeverity.LOW, ReportStatus.RESOLVED);
        when(reportService.getReportById(10L)).thenReturn(r1);

        mockMvc.perform(get("/api/reports/10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Broken Streetlight"))
                .andExpect(jsonPath("$.category").value("STREETLIGHTS"));
    }

    @Test
    @DisplayName("GET /api/reports/{id} returns 404 Not Found when ID does not exist")
    void getReportById_notFound() throws Exception {
        when(reportService.getReportById(999L)).thenThrow(new ResourceNotFoundException("Report", "id", 999L));

        mockMvc.perform(get("/api/reports/999")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message", containsString("Report not found with id: '999'")))
                .andExpect(jsonPath("$.path").value("/api/reports/999"));
    }

    @Test
    @DisplayName("POST /api/reports with valid request returns 201 Created and Location header")
    void createReport_success() throws Exception {
        CreateReportRequest request = new CreateReportRequest(
                "Large pothole causing vehicle damage",
                "Deep pothole in the right lane near the supermarket entrance",
                ReportCategory.ROADS,
                ReportSeverity.HIGH,
                "Near Market entrance, Sector 4",
                "https://example.com/pothole.jpg"
        );

        ReportResponse created = sampleResponse(42L, request.title(), request.category(), request.severity(), ReportStatus.PENDING);
        when(reportService.createReport(any(CreateReportRequest.class), any())).thenReturn(created);

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/reports/42")))
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.title").value(request.title()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/reports with large base64 image payload succeeds without truncation error")
    void createReport_withLargeBase64Image_success() throws Exception {
        // Generate a Base64 string > 65 KB to simulate realistic photo attachment (> 65,535 bytes)
        String largeBase64 = "data:image/jpeg;base64," + "A".repeat(80000);
        CreateReportRequest request = new CreateReportRequest(
                "Flooded intersection near school",
                "Clean water leaking from burst pipe flooding school entrance",
                ReportCategory.WATER_LEAKAGE,
                ReportSeverity.HIGH,
                "Maple St & 5th Ave",
                largeBase64
        );

        ReportResponse created = new ReportResponse(
                55L, request.title(), request.description(), request.category(),
                request.severity(), request.location(), ReportStatus.PENDING,
                largeBase64, Instant.now(), Instant.now()
        );
        when(reportService.createReport(any(CreateReportRequest.class), any())).thenReturn(created);

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/reports/55")))
                .andExpect(jsonPath("$.id").value(55))
                .andExpect(jsonPath("$.title").value(request.title()))
                .andExpect(jsonPath("$.imageUrl").value(largeBase64));
    }

    @Test
    @DisplayName("POST /api/reports with blank title and missing category returns 400 Bad Request with field errors")
    void createReport_validationFailure() throws Exception {
        // Missing category, blank title, short description (< 10 chars)
        String invalidJson = """
                {
                    "title": "",
                    "description": "Short",
                    "location": ""
                }
                """;

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.description").exists())
                .andExpect(jsonPath("$.errors.category").exists())
                .andExpect(jsonPath("$.errors.location").exists());
    }

    @Test
    @DisplayName("POST /api/reports with invalid enum value returns 400 Bad Request")
    void createReport_invalidEnum() throws Exception {
        String invalidEnumJson = """
                {
                    "title": "Valid Title Here",
                    "description": "Valid description of at least ten characters",
                    "category": "FLYING_SAUCER",
                    "location": "Main street"
                }
                """;

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidEnumJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("PATCH /api/reports/{id} without admin role returns 403 Forbidden")
    void updateReport_unauthorizedWithoutAdminRole() throws Exception {
        UpdateReportRequest request = new UpdateReportRequest(
                null, null, null, null, null, ReportStatus.IN_PROGRESS, null
        );

        mockMvc.perform(patch("/api/reports/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message", containsString("Administrator role credentials")));
    }

    @Test
    @DisplayName("PATCH /api/reports/{id} with admin credentials updates report and returns 200 OK")
    void updateReport_authorizedSuccess() throws Exception {
        UpdateReportRequest request = new UpdateReportRequest(
                null,
                null,
                null,
                ReportSeverity.HIGH,
                null,
                ReportStatus.IN_PROGRESS,
                null
        );

        ReportResponse updated = sampleResponse(1L, "Pothole on 5th", ReportCategory.ROADS, ReportSeverity.HIGH, ReportStatus.IN_PROGRESS);
        when(reportService.updateReport(eq(1L), any(UpdateReportRequest.class))).thenReturn(updated);

        mockMvc.perform(patch("/api/reports/1")
                .header("X-Admin-Role", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.severity").value("HIGH"));
    }

    @Test
    @DisplayName("PATCH /api/reports/{id} returns 404 Not Found when report does not exist")
    void updateReport_notFound() throws Exception {
        UpdateReportRequest request = new UpdateReportRequest(null, null, null, null, null, ReportStatus.RESOLVED, null);
        when(reportService.updateReport(eq(999L), any(UpdateReportRequest.class)))
                .thenThrow(new ResourceNotFoundException("Report", "id", 999L));

        mockMvc.perform(patch("/api/reports/999")
                .header("X-Admin-Role", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("PATCH /api/reports/{id} with invalid workflow transition returns 400 Bad Request")
    void updateReport_invalidWorkflowTransition() throws Exception {
        UpdateReportRequest request = new UpdateReportRequest(null, null, null, null, null, ReportStatus.PENDING, null);
        when(reportService.updateReport(eq(1L), any(UpdateReportRequest.class)))
                .thenThrow(new IllegalStateException("Invalid status transition: Report #1 cannot transition from [RESOLVED] to [PENDING]."));

        mockMvc.perform(patch("/api/reports/1")
                .header("X-Admin-Role", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString("Invalid status transition")));
    }

    @Test
    @DisplayName("PATCH /api/reports/{id} with invalid status enum string returns 400 Bad Request")
    void updateReport_invalidStatusEnum() throws Exception {
        String invalidStatusJson = """
                {
                    "status": "NONEXISTENT_STATUS"
                }
                """;

        mockMvc.perform(patch("/api/reports/1")
                .header("X-Admin-Role", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidStatusJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // =========================================================================
    // Phase 8: Image Upload & Serving Tests
    // =========================================================================

    @Test
    @DisplayName("POST /api/reports/images with valid image returns 201 Created and image URL")
    void uploadImage_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "evidence.jpg",
                "image/jpeg",
                "test-image-binary-data".getBytes()
        );

        ImageUploadResponse uploadResponse = new ImageUploadResponse(
                "/api/reports/images/test-uuid.jpg",
                "test-uuid.jpg",
                (long) "test-image-binary-data".length(),
                "image/jpeg"
        );

        when(fileStorageService.storeImage(any())).thenReturn(uploadResponse);

        mockMvc.perform(multipart("/api/reports/images").file(file))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.imageUrl").value("/api/reports/images/test-uuid.jpg"))
                .andExpect(jsonPath("$.fileName").value("test-uuid.jpg"))
                .andExpect(jsonPath("$.fileSize").value("test-image-binary-data".length()))
                .andExpect(jsonPath("$.contentType").value("image/jpeg"));
    }

    @Test
    @DisplayName("POST /api/reports/images with empty file returns 400 Bad Request")
    void uploadImage_emptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        when(fileStorageService.storeImage(any()))
                .thenThrow(new IllegalArgumentException("Failed to store empty image file."));

        mockMvc.perform(multipart("/api/reports/images").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString("empty image file")));
    }

    @Test
    @DisplayName("GET /api/reports/images/{fileName} returns 200 OK with resource and cache header")
    void getImage_success() throws Exception {
        Resource mockResource = new ByteArrayResource("test-image-content".getBytes());
        when(fileStorageService.loadImageAsResource("photo-123.jpg")).thenReturn(mockResource);
        when(fileStorageService.probeContentType("photo-123.jpg")).thenReturn("image/jpeg");

        mockMvc.perform(get("/api/reports/images/photo-123.jpg"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=86400")))
                .andExpect(content().contentType(MediaType.IMAGE_JPEG));
    }

    @Test
    @DisplayName("GET /api/reports/images/{fileName} for nonexistent file returns 404 Not Found")
    void getImage_notFound() throws Exception {
        when(fileStorageService.loadImageAsResource("nonexistent.jpg"))
                .thenThrow(new ResourceNotFoundException("Image", "fileName", "nonexistent.jpg"));

        mockMvc.perform(get("/api/reports/images/nonexistent.jpg"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/reports/{id} as owner returns 204 No Content")
    void deleteReport_asOwner_returns204() throws Exception {
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken principal =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "jane@example.com", "N/A",
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
                );

        doNothing().when(reportService).deleteReport(1L, "jane@example.com", false);

        mockMvc.perform(delete("/api/reports/1").principal(principal))
                .andExpect(status().isNoContent());

        verify(reportService).deleteReport(1L, "jane@example.com", false);
    }

    @Test
    @DisplayName("DELETE /api/reports/{id} as admin returns 204 No Content")
    void deleteReport_asAdmin_returns204() throws Exception {
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken adminPrincipal =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "admin@localfix.org", "N/A",
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))
                );

        doNothing().when(reportService).deleteReport(1L, "admin@localfix.org", true);

        mockMvc.perform(delete("/api/reports/1").principal(adminPrincipal))
                .andExpect(status().isNoContent());

        verify(reportService).deleteReport(1L, "admin@localfix.org", true);
    }

    @Test
    @DisplayName("DELETE /api/reports/{id} for non-owner returns 403 Forbidden")
    void deleteReport_asNonOwner_returns403() throws Exception {
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken principal =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "intruder@example.com", "N/A",
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
                );

        doThrow(new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this report."))
                .when(reportService).deleteReport(1L, "intruder@example.com", false);

        mockMvc.perform(delete("/api/reports/1").principal(principal))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message", containsString("do not have permission to delete")));
    }

    @Test
    @DisplayName("DELETE /api/reports/{id} with nonexistent ID returns 404 Not Found")
    void deleteReport_notFound_returns404() throws Exception {
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken principal =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "jane@example.com", "N/A",
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
                );

        doThrow(new ResourceNotFoundException("Report", "id", 999L))
                .when(reportService).deleteReport(999L, "jane@example.com", false);

        mockMvc.perform(delete("/api/reports/999").principal(principal))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
