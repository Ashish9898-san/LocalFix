package com.localfix.repository;

import com.localfix.entity.DatabaseCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * DatabaseCheckRepository
 *
 * Spring Data JPA Repository interface for DatabaseCheck entity.
 *
 * Concepts Explained:
 * 1. JpaRepository<DatabaseCheck, Long>: Extends Spring Data's generic interface.
 *    - First parameter (DatabaseCheck): The managed entity type.
 *    - Second parameter (Long): The primary key (@Id) data type.
 * 2. Zero Boilerplate SQL: By extending JpaRepository, Spring automatically provides
 *    methods like save(), findById(), findAll(), deleteById(), and count() without
 *    writing a single line of SQL or manual JDBC code.
 * 3. @Repository: Marks this interface as a Spring Data access component.
 */
@Repository
public interface DatabaseCheckRepository extends JpaRepository<DatabaseCheck, Long> {
}
