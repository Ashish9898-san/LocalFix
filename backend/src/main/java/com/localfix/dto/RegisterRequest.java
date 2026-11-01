package com.localfix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * RegisterRequest DTO
 *
 * Payload sent by citizen clients to create a new user account.
 * Note: Role cannot be specified by the client; public registration always assigns USER role.
 */
public record RegisterRequest(
    @NotBlank(message = "Name cannot be blank.")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters.")
    String name,

    @NotBlank(message = "Email address cannot be blank.")
    @Email(message = "Please provide a valid email address.")
    @Size(max = 150, message = "Email cannot exceed 150 characters.")
    String email,

    @NotBlank(message = "Password cannot be blank.")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters.")
    String password
) {}
