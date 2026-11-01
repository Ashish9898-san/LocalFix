package com.localfix.repository;

import com.localfix.entity.User;
import com.localfix.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository
 *
 * Spring Data JPA repository for User accounts.
 * Provides case-insensitive lookup methods for user authentication and uniqueness enforcement.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(UserRole role);
}
