package com.localfix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * LoginRequest DTO
 *
 * Payload sent to authenticate an existing user or administrator.
 */
public record LoginRequest(
    @NotBlank(message = "Email address is required.")
    @Email(message = "Please provide a valid email address.")
    String email,

    @NotBlank(message = "Password is required.")
    String password
) {}
