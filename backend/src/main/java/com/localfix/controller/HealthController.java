package com.localfix.controller;

import com.localfix.dto.DatabaseHealthResponse;
import com.localfix.dto.HealthResponse;
import com.localfix.repository.DatabaseCheckRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthController
 *
 * REST Controller responsible for exposing application and database health endpoints.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class HealthController {

    private final DatabaseCheckRepository databaseCheckRepository;

    public HealthController(DatabaseCheckRepository databaseCheckRepository) {
        this.databaseCheckRepository = databaseCheckRepository;
    }

    /**
     * Application health check endpoint (Preserved from Phase 3).
     *
     * @return 200 OK with HealthResponse JSON
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> checkHealth() {
        return ResponseEntity.ok(HealthResponse.up());
    }

    /**
     * Database connectivity verification endpoint (Phase 4).
     * Performs a lightweight query to ensure MySQL is connected and responding.
     * Never exposes credentials or internal database errors.
     *
     * @return 200 OK if connected, 503 SERVICE_UNAVAILABLE if unreachable
     */
    @GetMapping("/health/db")
    public ResponseEntity<DatabaseHealthResponse> checkDatabaseHealth() {
        try {
            long count = databaseCheckRepository.count();
            return ResponseEntity.ok(DatabaseHealthResponse.up(count));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(DatabaseHealthResponse.down("Database is unreachable or credentials invalid"));
        }
    }
}
