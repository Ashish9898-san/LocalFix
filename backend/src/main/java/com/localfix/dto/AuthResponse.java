package com.localfix.dto;

import com.localfix.entity.UserRole;

/**
 * AuthResponse DTO
 *
 * Returned upon successful registration or login.
 * Contains the signed JWT bearer token and user summary.
 */
public record AuthResponse(
    String token,
    Long id,
    String name,
    String email,
    UserRole role
) {}
