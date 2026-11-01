package com.localfix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfix.dto.AuthResponse;
import com.localfix.dto.LoginRequest;
import com.localfix.dto.RegisterRequest;
import com.localfix.dto.UserResponse;
import com.localfix.entity.UserRole;
import com.localfix.exception.GlobalExceptionHandler;
import com.localfix.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/register with valid input returns 201 Created and AuthResponse")
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest("David Warner", "david@example.com", "Password123");
        AuthResponse response = new AuthResponse("jwt.mock.token", 10L, "David Warner", "david@example.com", UserRole.USER);

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt.mock.token"))
                .andExpect(jsonPath("$.name").value("David Warner"))
                .andExpect(jsonPath("$.email").value("david@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid email returns 400 Bad Request")
    void register_invalidEmail_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("David", "not-an-email", "Password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email", containsString("valid email")));
    }

    @Test
    @DisplayName("POST /api/auth/register with short password returns 400 Bad Request")
    void register_shortPassword_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("David", "david@example.com", "123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password", containsString("at least 6 characters")));
    }

    @Test
    @DisplayName("POST /api/auth/login with valid credentials returns 200 OK and AuthResponse")
    void login_success() throws Exception {
        LoginRequest request = new LoginRequest("david@example.com", "Password123");
        AuthResponse response = new AuthResponse("jwt.login.token", 10L, "David Warner", "david@example.com", UserRole.USER);

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.login.token"))
                .andExpect(jsonPath("$.email").value("david@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login with invalid credentials returns 401 Unauthorized")
    void login_invalidCredentials_returnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("david@example.com", "WrongPassword");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password."));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    @DisplayName("GET /api/auth/me with authenticated principal returns UserResponse")
    void getMe_authenticated_returnsUserResponse() throws Exception {
        UserResponse userResponse = new UserResponse(10L, "David Warner", "david@example.com", UserRole.USER, Instant.now());
        when(authService.getCurrentUser("david@example.com")).thenReturn(userResponse);

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken principal =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "david@example.com", null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")));

        mockMvc.perform(get("/api/auth/me").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("David Warner"))
                .andExpect(jsonPath("$.email").value("david@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }
}
