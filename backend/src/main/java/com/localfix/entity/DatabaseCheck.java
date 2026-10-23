package com.localfix.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * DatabaseCheck Entity
 *
 * Demonstrates how a Java class maps directly to a relational MySQL table
 * using JPA (Java Persistence API) and Hibernate.
 *
 * Concepts Explained:
 * 1. @Entity: Marks this class as a persistent database entity. Hibernate will map it
 *    to a table in the MySQL database.
 * 2. @Table(name = "database_checks"): Explicitly specifies the table name in MySQL.
 * 3. @Id: Designates this field as the Primary Key (unique identifier for each row).
 * 4. @GeneratedValue(strategy = GenerationType.IDENTITY): Delegates primary key generation
 *    to MySQL's native AUTO_INCREMENT column feature.
 * 5. @Column: Configures column constraints (e.g. nullable, length).
 */
@Entity
@Table(name = "database_checks")
public class DatabaseCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Default no-argument constructor (required by JPA / Hibernate specification)
    public DatabaseCheck() {
    }

    // Convenience constructor for creating new records
    public DatabaseCheck(String message) {
        this.message = message;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "DatabaseCheck{" +
                "id=" + id +
                ", message='" + message + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
