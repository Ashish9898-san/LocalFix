package com.localfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfix.dto.CreateReportRequest;
import com.localfix.dto.ReportResponse;
import com.localfix.dto.UpdateReportRequest;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;
import com.localfix.exception.GlobalExceptionHandler;
import com.localfix.exception.ResourceNotFoundException;
import com.localfix.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web Layer Slice Tests for ReportController using @WebMvcTest.
 * Focuses strictly on HTTP handling, JSON serialization, URL mappings,
 * Jakarta Bean Validation, and GlobalExceptionHandler behavior.
 * Does not initialize real database or Hikari connection pool.
 */
@WebMvcTest(ReportController.class)
@Import(GlobalExceptionHandler.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportService reportService;

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
        when(reportService.createReport(any(CreateReportRequest.class))).thenReturn(created);

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
    @DisplayName("PATCH /api/reports/{id} updates report and returns 200 OK")
    void updateReport_success() throws Exception {
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
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
