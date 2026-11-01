package com.localfix.dto;

import com.localfix.entity.User;
import com.localfix.entity.UserRole;
import java.time.Instant;

/**
 * UserResponse DTO
 *
 * Returned by GET /api/auth/me to provide profile information for the authenticated user.
 * Passwords or sensitive authentication tokens are strictly excluded.
 */
public record UserResponse(
    Long id,
    String name,
    String email,
    UserRole role,
    Instant createdAt
) {
    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt()
        );
    }
}
