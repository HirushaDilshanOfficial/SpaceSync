package com.spacesync.auth;

import com.spacesync.user.Role;
import com.spacesync.user.User;
import com.spacesync.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * REST controller for authentication and authorization operations.
 *
 * Endpoints (Member 4 – Module E):
 *  GET  /api/auth/me              – Get current user profile
 *  GET  /api/auth/roles           – List all available roles (ADMIN)
 *  POST /api/auth/assign-role     – Assign role to a user (ADMIN)
 *
 * @author Member 4 – Module E (Authentication & Authorization)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/me
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the currently authenticated user's profile.
     * The email is extracted from the JWT principal set by JwtAuthenticationFilter.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id",         user.getId(),
                        "name",       user.getName(),
                        "email",      user.getEmail(),
                        "role",       user.getRole().name(),
                        "pictureUrl", user.getPictureUrl() != null ? user.getPictureUrl() : "",
                        "createdAt",  user.getCreatedAt().toString()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/roles  (ADMIN only)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all roles available in the system.
     * Useful for the admin role-assignment UI.
     */
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getAllRoles() {
        List<String> roles = Arrays.stream(Role.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(roles);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/assign-role  (ADMIN only)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Assigns a new role to the specified user.
     */
    @PostMapping("/assign-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignRole(@Valid @RequestBody AssignRoleRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    user.setRole(request.getRole());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "message", "Role updated successfully",
                            "email",   user.getEmail(),
                            "newRole", user.getRole().name()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/dev-login  (DEVELOPMENT ONLY)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Development endpoint to bypass Google OAuth2.
     * Generates a test ADMIN user and returns a valid JWT.
     */
    @PostMapping("/dev-login")
    public ResponseEntity<?> devMockLogin() {
        // Find or create test user
        User user = userRepository.findByEmail("test_admin@spacesync.edu")
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name("Test Instructor")
                            .email("test_admin@spacesync.edu")
                            .role(Role.ADMIN)
                            .active(true)
                            .pictureUrl("https://ui-avatars.com/api/?name=Test+Instructor&background=a371f7&color=fff")
                            .build();
                    return userRepository.save(newUser);
                });

        // ── Generate JWT ─────────────────────────────────────────────────────
        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Request DTOs
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    public static class AssignRoleRequest {
        @NotBlank @Email
        private String email;
        @NotNull
        private Role role;
    }
}
