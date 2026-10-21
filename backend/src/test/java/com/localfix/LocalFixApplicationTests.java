package com.localfix;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * LocalFixApplicationTests
 *
 * Verifies that the Spring Boot application boots successfully and that
 * the health check REST endpoint behaves as expected.
 */
@SpringBootTest
@AutoConfigureMockMvc
class LocalFixApplicationTests {

    @Autowired
    private MockMvc mockMvc;

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
}
