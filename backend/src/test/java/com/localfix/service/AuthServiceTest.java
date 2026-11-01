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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("register encodes password, creates USER role, and returns JWT token")
    void register_success() {
        RegisterRequest request = new RegisterRequest("Alice Smith", "alice@example.com", "PlainPass123");

        when(userRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("PlainPass123")).thenReturn("$2a$10$hashedPasswordSample");

        User savedUser = new User("Alice Smith", "alice@example.com", "$2a$10$hashedPasswordSample", UserRole.USER);
        savedUser.setId(1L);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("sample.jwt.token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("sample.jwt.token");
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("Alice Smith");
        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.role()).isEqualTo(UserRole.USER);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(UserRole.USER);
        assertThat(captor.getValue().getPassword()).isEqualTo("$2a$10$hashedPasswordSample");
    }

    @Test
    @DisplayName("register throws IllegalArgumentException when email is already registered")
    void register_duplicateEmail_throwsIllegalArgument() {
        RegisterRequest request = new RegisterRequest("Bob", "bob@example.com", "Secret123");
        when(userRepository.existsByEmailIgnoreCase("bob@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertThat(ex.getMessage()).contains("already exists");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login with valid credentials returns JWT token and user info")
    void login_validCredentials_success() {
        LoginRequest request = new LoginRequest("alice@example.com", "PlainPass123");
        User user = new User("Alice", "alice@example.com", "$2a$10$hashed", UserRole.USER);
        user.setId(5L);

        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("PlainPass123", "$2a$10$hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("valid.login.jwt");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("valid.login.jwt");
        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.role()).isEqualTo(UserRole.USER);
    }

    @Test
    @DisplayName("login with wrong password throws BadCredentialsException")
    void login_wrongPassword_throwsBadCredentials() {
        LoginRequest request = new LoginRequest("alice@example.com", "WrongPassword");
        User user = new User("Alice", "alice@example.com", "$2a$10$hashed", UserRole.USER);

        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "$2a$10$hashed")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("login with non-existent email throws BadCredentialsException")
    void login_nonExistentUser_throwsBadCredentials() {
        LoginRequest request = new LoginRequest("ghost@example.com", "Password");
        when(userRepository.findByEmailIgnoreCase("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("getCurrentUser returns clean UserResponse without exposing password")
    void getCurrentUser_success() {
        User user = new User("Carol", "carol@example.com", "$2a$10$hashedSecret", UserRole.USER);
        user.setId(7L);

        when(userRepository.findByEmailIgnoreCase("carol@example.com")).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser("carol@example.com");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.name()).isEqualTo("Carol");
        assertThat(response.email()).isEqualTo("carol@example.com");
        assertThat(response.role()).isEqualTo(UserRole.USER);
    }

    @Test
    @DisplayName("getCurrentUser throws ResourceNotFoundException if user does not exist")
    void getCurrentUser_notFound() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUser("unknown@example.com"));
    }
}
