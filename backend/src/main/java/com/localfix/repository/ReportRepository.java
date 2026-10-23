package com.localfix.repository;

import com.localfix.entity.Report;
import com.localfix.entity.ReportCategory;
import com.localfix.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ReportRepository
 *
 * Spring Data JPA repository for the Report entity.
 * Provides out-of-the-box CRUD operations and custom query methods.
 *
 * Concepts Explained:
 * Spring Data JPA parses query method names (such as "findAllByOrderByCreatedAtDesc")
 * and generates the appropriate SQL query with "ORDER BY created_at DESC" automatically.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * Retrieve all reports ordered by creation date newest first.
     */
    List<Report> findAllByOrderByCreatedAtDesc();

    /**
     * Filter reports by category ordered newest first.
     */
    List<Report> findByCategoryOrderByCreatedAtDesc(ReportCategory category);

    /**
     * Filter reports by status ordered newest first.
     */
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);

    /**
     * Filter reports by both category and status ordered newest first.
     */
    List<Report> findByCategoryAndStatusOrderByCreatedAtDesc(ReportCategory category, ReportStatus status);
}
