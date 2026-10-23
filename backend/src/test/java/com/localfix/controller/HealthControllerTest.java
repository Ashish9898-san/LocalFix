package com.localfix.controller;

import com.localfix.repository.DatabaseCheckRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web Layer Slice Tests for HealthController.
 */
@WebMvcTest(HealthController.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DatabaseCheckRepository databaseCheckRepository;

    @Test
    @DisplayName("GET /api/health returns 200 OK and valid health payload")
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
    @DisplayName("GET /api/health/db returns 200 OK when database is accessible")
    void testDatabaseHealth_up() throws Exception {
        when(databaseCheckRepository.count()).thenReturn(5L);

        mockMvc.perform(get("/api/health/db")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("MySQL"))
                .andExpect(jsonPath("$.verifiedRecordCount").value(5));
    }

    @Test
    @DisplayName("GET /api/health/db returns 503 SERVICE_UNAVAILABLE when database fails")
    void testDatabaseHealth_down() throws Exception {
        when(databaseCheckRepository.count()).thenThrow(new RuntimeException("Connection refused"));

        mockMvc.perform(get("/api/health/db")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("DOWN"))
                .andExpect(jsonPath("$.message").value("Database is unreachable or credentials invalid"));
    }
}
