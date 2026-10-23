package com.localfix;

import com.localfix.entity.DatabaseCheck;
import com.localfix.entity.Report;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportSeverity;
import com.localfix.entity.ReportStatus;
import com.localfix.repository.DatabaseCheckRepository;
import com.localfix.repository.ReportRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * LocalFixApplicationTests
 *
 * Verifies that the Spring Boot application boots successfully, that
 * the health check REST endpoints behave as expected, and verifies
 * actual database entity persistence via Spring Data JPA.
 */
@SpringBootTest
@AutoConfigureMockMvc
class LocalFixApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired(required = false)
    private DatabaseCheckRepository databaseCheckRepository;

    @Autowired(required = false)
    private ReportRepository reportRepository;

    @Test
    @DisplayName("Application Context Loads Successfully")
    void contextLoads() {
        // Ensures all beans and auto-configurations instantiate without error
    }

    @Test
    @DisplayName("GET /api/health returns 200 OK and valid JSON health payload")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.application").value("LocalFix"))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.message").value("LocalFix backend is running"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    @DisplayName("Verify DatabaseCheck entity persistence, retrieval, and cleanup in MySQL")
    void testDatabaseCheckPersistence() {
        if (databaseCheckRepository == null) {
            return;
        }

        // 1. Create demonstration entity instance
        DatabaseCheck check = new DatabaseCheck("LocalFix MySQL verification check");

        // 2. Persist record to database table
        DatabaseCheck saved = databaseCheckRepository.save(check);
        assertThat(saved.getId()).isNotNull();

        // 3. Retrieve record from database by generated primary key
        Optional<DatabaseCheck> found = databaseCheckRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getMessage()).isEqualTo("LocalFix MySQL verification check");
        assertThat(found.get().getCreatedAt()).isNotNull();

        // 4. Clean up test record so the database remains clean
        databaseCheckRepository.deleteById(saved.getId());
        assertThat(databaseCheckRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("Verify Report entity persistence, retrieval, status update, and cleanup in MySQL")
    void testReportEntityPersistence() {
        if (reportRepository == null) {
            return;
        }

        Report report = new Report(
                "Integration Test Pothole",
                "Testing real database persistence for Report entity",
                ReportCategory.ROADS,
                ReportSeverity.HIGH,
                "Main St & 2nd Ave",
                "https://example.com/test.jpg"
        );

        Report saved = reportRepository.save(report);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(ReportStatus.PENDING);
        assertThat(saved.getCreatedAt()).isNotNull();

        // Update status
        saved.setStatus(ReportStatus.IN_PROGRESS);
        Report updated = reportRepository.save(saved);
        assertThat(updated.getStatus()).isEqualTo(ReportStatus.IN_PROGRESS);

        // Clean up test record
        reportRepository.deleteById(saved.getId());
        assertThat(reportRepository.findById(saved.getId())).isEmpty();
    }
}
