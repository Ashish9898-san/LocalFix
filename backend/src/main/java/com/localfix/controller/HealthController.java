package com.localfix.controller;

import com.localfix.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthController
 *
 * REST Controller responsible for exposing application health and diagnostic endpoints.
 *
 * Concepts Explained:
 * 1. @RestController: Combines @Controller and @ResponseBody. Tells Spring that return values
 *    from methods in this class should be automatically serialized into JSON and written
 *    directly to the HTTP response body, rather than rendering an HTML view.
 *
 * 2. @RequestMapping("/api"): Sets the base path for all route handlers in this controller.
 *    Any method inside will be prefixed with "/api".
 *
 * 3. @CrossOrigin: Configures CORS (Cross-Origin Resource Sharing), allowing our React
 *    frontend (running on http://localhost:5173) to communicate with this backend.
 *
 * 4. @GetMapping("/health"): Specifies that this method handles incoming HTTP GET requests
 *    at the URL: http://localhost:8080/api/health
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class HealthController {

    /**
     * Health check endpoint.
     *
     * @return ResponseEntity containing a 200 OK status and HealthResponse JSON body
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> checkHealth() {
        HealthResponse response = HealthResponse.up();
        return ResponseEntity.ok(response);
    }
}
