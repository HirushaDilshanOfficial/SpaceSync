package com.spacesync.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for user management operations (ADMIN facing).
 *
 * Endpoints (Member 4 – Module E):
 *  GET    /api/users        – List all registered users
 *  DELETE /api/users/{id}   – Deactivate / remove a user
 *
 * @author Member 4 – Module E (Authentication & Authorization)
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/users
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns a list of all registered users with their role and status.
     * Admin-only endpoint.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getName());
                    map.put("email", u.getEmail());
                    map.put("role", u.getRole().name());
                    map.put("active", u.isActive());
                    map.put("createdAt", u.getCreatedAt().toString());
                    map.put("pictureUrl", u.getPictureUrl() != null ? u.getPictureUrl() : "");
                    return map;
                })
                .toList();
        return ResponseEntity.ok(users);
    }

    /**
     * Creates a new user (Admin manual add).
     */
    @PostMapping
    public ResponseEntity<?> createUser(@jakarta.validation.Valid @RequestBody UserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email already exists"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(java.util.Map.of("message", "User created successfully"));
    }

    /**
     * Updates user details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @jakarta.validation.Valid @RequestBody UserUpdateRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(request.getName());
                    user.setEmail(request.getEmail());
                    userRepository.save(user);
                    return ResponseEntity.ok(java.util.Map.of("message", "User updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/users/{id}
    // ─────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/users/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Deactivates a user account (soft delete – sets active = false).
     * Admin-only endpoint.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setActive(false);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "message", "User deactivated successfully",
                            "userId",  id
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Re-activates a user account.
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setActive(true);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "User activated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Updates a user's role.
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable String id, @RequestParam Role role) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(role);
                    userRepository.save(user);
                    return ResponseEntity.ok(java.util.Map.of("message", "User role updated to " + role));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DTOs
    // ─────────────────────────────────────────────────────────────────────────

    @lombok.Data
    public static class UserCreateRequest {
        @jakarta.validation.constraints.NotBlank
        private String name;
        @jakarta.validation.constraints.NotBlank
        @jakarta.validation.constraints.Email
        private String email;
        @jakarta.validation.constraints.NotBlank
        private String password;
        @jakarta.validation.constraints.NotNull
        private Role role;
    }

    @lombok.Data
    public static class UserUpdateRequest {
        @jakarta.validation.constraints.NotBlank
        private String name;
        @jakarta.validation.constraints.NotBlank
        @jakarta.validation.constraints.Email
        private String email;
    }
}
