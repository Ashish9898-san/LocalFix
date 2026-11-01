package com.localfix.security;

import com.localfix.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtService
 *
 * Handles creation, signing, parsing, and cryptographic verification of JSON Web Tokens.
 *
 * Concepts Explained for Beginners:
 * 1. Stateless Authentication: Instead of storing sessions in server memory, the server signs
 *    a token containing the user's identity (email, role, ID) and sends it to the client.
 * 2. HMAC-SHA256 Signing: Cryptographically guarantees that client tokens cannot be forged or tampered with.
 * 3. Expiration: Tokens expire automatically after 24 hours, mitigating token theft risks.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    // Default 256-bit HMAC key for local development (override in production via LOCALFIX_JWT_SECRET)
    private static final String DEFAULT_SECRET = "localfix-super-secret-jwt-signing-key-for-btech-project-2026-auth";

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${localfix.jwt.secret:" + DEFAULT_SECRET + "}") String secret,
            @Value("${localfix.jwt.expiration-ms:86400000}") long expirationMs) {
        // Ensure secret meets minimum HMAC-SHA256 256-bit (32 bytes) requirement
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            String padded = (secret + "01234567890123456789012345678901").substring(0, 32);
            keyBytes = padded.getBytes(StandardCharsets.UTF_8);
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /**
     * Generate a signed JWT token for an authenticated user.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("name", user.getName());
        claims.put("role", user.getRole().name());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getEmail().toLowerCase())
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extract the user's email (subject) from a token.
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract the role string from a token.
     */
    public String extractRole(String token) {
        Object role = extractAllClaims(token).get("role");
        return role != null ? role.toString() : null;
    }

    /**
     * Validate token signature and check expiration.
     */
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token received: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Parses and returns all claims from the JWT token.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
