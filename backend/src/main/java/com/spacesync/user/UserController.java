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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

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
                .map(u -> Map.of(
                        "id",         (Object) u.getId(),
                        "name",       u.getName(),
                        "email",      u.getEmail(),
                        "role",       u.getRole().name(),
                        "active",     u.isActive(),
                        "createdAt",  u.getCreatedAt().toString(),
                        "pictureUrl", u.getPictureUrl() != null ? u.getPictureUrl() : ""
                ))
                .toList();
        return ResponseEntity.ok(users);
    }

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
}
