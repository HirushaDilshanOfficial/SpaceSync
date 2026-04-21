package com.spacesync.notification;

import com.spacesync.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the Notifications module (Module D).
 *
 * Endpoints:
 *  GET    /api/notifications                – Get all notifications for current user
 *  GET    /api/notifications/unread-count   – Get unread count for current user
 *  PUT    /api/notifications/{id}/read      – Mark a single notification as read
 *  PUT    /api/notifications/read-all       – Mark all notifications as read
 *  DELETE /api/notifications/{id}           – Delete a notification
 *  POST   /api/notifications/send           – Admin: send a notification to any user
 *
 * @author Member 4 – Module D (Notifications)
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository      userRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/notifications
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all notifications for the currently authenticated user, newest first.
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication auth) {
        String userId = resolveUserId(auth);
        List<NotificationResponse> list = notificationService
                .getNotificationsForUser(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/notifications/unread-count
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the number of unread notifications for the current user.
     * Used by the React notification bell badge.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        String userId = resolveUserId(auth);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/notifications/{id}/read
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Marks a specific notification as read.
     * Only the owner of the notification can mark it as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable String id,
                                                           Authentication auth) {
        String userId = resolveUserId(auth);
        Notification updated = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(NotificationResponse.from(updated));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/notifications/read-all
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Marks every unread notification as read for the current user.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication auth) {
        String userId = resolveUserId(auth);
        int updated = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "updated", updated
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/notifications/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Deletes a notification. Only the owner can delete their own notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String id,
                                                                  Authentication auth) {
        String userId = resolveUserId(auth);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/notifications/send  (ADMIN only)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Allows an admin to manually send a notification to a specific user.
     * Useful for announcements and system alerts.
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponse> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {

        Notification notification = notificationService.sendNotification(
                request.getRecipientEmail(),
                request.getType(),
                request.getTitle(),
                request.getMessage(),
                request.getReferenceId(),
                request.getActionUrl()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(NotificationResponse.from(notification));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Resolves the DB userId from the authenticated email (JWT principal). */
    private String resolveUserId(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"))
                .getId();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DTOs
    // ─────────────────────────────────────────────────────────────────────────

    /** Response DTO – safe to serialize (avoids lazy loading issues). */
    public record NotificationResponse(
            String id,
            String type,
            String title,
            String message,
            String referenceId,
            String actionUrl,
            boolean read,
            String createdAt,
            String readAt
    ) {
        static NotificationResponse from(Notification n) {
            return new NotificationResponse(
                    n.getId(),
                    n.getType().name(),
                    n.getTitle(),
                    n.getMessage(),
                    n.getReferenceId(),
                    n.getActionUrl(),
                    n.isRead(),
                    n.getCreatedAt().toString(),
                    n.getReadAt() != null ? n.getReadAt().toString() : null
            );
        }
    }

    /** Request DTO for admin-send endpoint. */
    @Data
    public static class SendNotificationRequest {
        @NotBlank @Email
        private String recipientEmail;
        @NotNull
        private NotificationType type;
        @NotBlank
        private String title;
        @NotBlank
        private String message;
        private String referenceId;
        private String actionUrl;
    }
}
