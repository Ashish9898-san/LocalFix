package com.localfix.security;

import com.localfix.entity.User;
import com.localfix.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService("localfix-super-secret-jwt-signing-key-for-btech-project-2026-auth", 3600000L);
    }

    @Test
    @DisplayName("generateToken produces valid token and claims can be extracted")
    void generateToken_andExtractClaims() {
        User user = new User("John Citizen", "john@example.com", "hash", UserRole.USER);
        user.setId(101L);

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.extractEmail(token)).isEqualTo("john@example.com");
        assertThat(jwtService.extractRole(token)).isEqualTo("USER");
    }

    @Test
    @DisplayName("validateToken returns false for invalid or tampered token")
    void validateToken_invalidToken() {
        assertThat(jwtService.validateToken("invalid.jwt.token")).isFalse();
        assertThat(jwtService.validateToken(null)).isFalse();
        assertThat(jwtService.validateToken("")).isFalse();
    }
}
