package com.spacesync.notification;

import com.spacesync.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a notification delivered to a user.
 * Notifications are created by the system when booking/ticket events occur.
 *
 * @author Member 4 – Module D (Notifications)
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** The user who receives this notification */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    /** Category of notification */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private NotificationType type;

    /** Short subject line shown in the notification bell */
    @Column(nullable = false)
    private String title;

    /** Full notification body with details */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** Optional: ID of the related entity (booking ID or ticket ID) */
    private String referenceId;

    /** Optional: Route path on the frontend to navigate when clicked */
    private String actionUrl;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }
}
