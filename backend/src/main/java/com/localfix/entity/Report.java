package com.localfix.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Report Entity
 *
 * Represents a civic problem report stored in the MySQL "reports" table.
 *
 * Concepts Explained:
 * 1. @Entity: Specifies that this Java class is an entity and is mapped to a database table.
 * 2. @Table(name = "reports"): Directs Hibernate to map instances to the "reports" MySQL table.
 * 3. @Enumerated(EnumType.STRING): Saves enum values as readable strings in MySQL (e.g. "ROADS", "PENDING")
 *    instead of numeric ordinals (0, 1, 2) which are brittle if enum order ever changes.
 * 4. @PrePersist & @PreUpdate: JPA lifecycle callback annotations that automatically set creation
 *    and modification timestamps before SQL statements are executed.
 */
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReportCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportSeverity severity = ReportSeverity.MEDIUM;

    @Column(nullable = false, length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // Required by JPA specification
    public Report() {
    }

    public Report(String title, String description, ReportCategory category,
                  ReportSeverity severity, String location, String imageUrl) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.severity = severity != null ? severity : ReportSeverity.MEDIUM;
        this.location = location;
        this.imageUrl = imageUrl;
        this.status = ReportStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) {
            this.status = ReportStatus.PENDING;
        }
        if (this.severity == null) {
            this.severity = ReportSeverity.MEDIUM;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ReportCategory getCategory() {
        return category;
    }

    public void setCategory(ReportCategory category) {
        this.category = category;
    }

    public ReportSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(ReportSeverity severity) {
        this.severity = severity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
