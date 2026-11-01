package com.localfix.service;

import com.localfix.dto.AuthResponse;
import com.localfix.dto.LoginRequest;
import com.localfix.dto.RegisterRequest;
import com.localfix.dto.UserResponse;
import com.localfix.entity.User;
import com.localfix.entity.UserRole;
import com.localfix.exception.ResourceNotFoundException;
import com.localfix.repository.UserRepository;
import com.localfix.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService
 *
 * Implements business logic for citizen registration, login, and profile lookup.
 *
 * Concepts Explained for Beginners:
 * 1. Password Hashing: Plaintext passwords are never stored in MySQL. BCrypt adds a unique
 *    cryptographic salt and performs hundreds of hash iterations to prevent rainbow table attacks.
 * 2. Role Assignment: Public registrations are strictly assigned USER role. The client has no
 *    power or parameter to request ADMIN status.
 * 3. Case Normalization: Emails are converted to lowercase before lookup or save to ensure
 *    case-insensitive matching across database engines.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Register a new citizen account.
     * Always assigns UserRole.USER.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with email '" + normalizedEmail + "' already exists.");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(
                request.name().trim(),
                normalizedEmail,
                hashedPassword,
                UserRole.USER
        );

        User savedUser = userRepository.save(user);
        log.info("Registered new user account: id={}, email={}", savedUser.getId(), savedUser.getEmail());

        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    /**
     * Authenticate an existing user or administrator.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user);
        log.info("Successful login for user: id={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    /**
     * Retrieve the profile of the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserResponse.fromEntity(user);
    }
}
