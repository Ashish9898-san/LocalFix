package com.localfix.entity;

/**
 * UserRole
 *
 * Defines authorization roles for LocalFix users:
 * - USER: Standard registered citizen. Can submit reports, view public reports, and view own reports.
 * - ADMIN: City official / administrator. Can triage, manage, and update report statuses.
 */
public enum UserRole {
    USER,
    ADMIN;

    /**
     * Returns Spring Security compatible authority string prefixed with "ROLE_".
     */
    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
