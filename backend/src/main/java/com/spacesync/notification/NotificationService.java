package com.spacesync.notification;

import com.spacesync.user.User;
import com.spacesync.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for notification operations.
 *
 * This service is called by other modules (Booking, Ticket) to dispatch
 * notifications when workflow events occur (approval, rejection, etc.).
 *
 * @author Member 4 – Module D (Notifications)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Create / Send
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sends a notification to a specific user by their email.
     * Called internally by booking/ticket services and by the admin API.
     */
    @Transactional
    public Notification sendNotification(String recipientEmail,
                                         NotificationType type,
                                         String title,
                                         String message,
                                         String referenceId,
                                         String actionUrl) {
        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Recipient not found: " + recipientEmail));

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .actionUrl(actionUrl)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification sent to {} – type: {}", recipientEmail, type);
        return saved;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all notifications for a user (newest first).
     */
    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Returns only unread notifications for a user.
     */
    public List<Notification> getUnreadNotificationsForUser(String userId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Returns the count of unread notifications for a user.
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read / Delete
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Marks a single notification as read.
     *
     * @throws IllegalArgumentException if the notification doesn't belong to the user
     */
    @Transactional
    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Notification not found: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new SecurityException("Access denied: notification doesn't belong to user.");
        }

        notification.markAsRead();
        return notificationRepository.save(notification);
    }

    /**
     * Marks all unread notifications as read for a user.
     *
     * @return number of notifications updated
     */
    @Transactional
    public int markAllAsRead(String userId) {
        int count = notificationRepository.markAllReadByUserId(userId);
        log.info("Marked {} notifications as read for user {}", count, userId);
        return count;
    }

    /**
     * Deletes a notification — only if it belongs to the requesting user.
     */
    @Transactional
    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Notification not found: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new SecurityException("Access denied: notification doesn't belong to user.");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper – called by other modules
    // ─────────────────────────────────────────────────────────────────────────

    /** Convenience: notify about booking approval */
    public void notifyBookingApproved(String userEmail, String bookingId, String resourceName) {
        sendNotification(userEmail,
                NotificationType.BOOKING_APPROVED,
                "Booking Approved ✅",
                "Your booking for \"" + resourceName + "\" has been approved.",
                bookingId,
                "/bookings/" + bookingId);
    }

    /** Convenience: notify about booking rejection */
    public void notifyBookingRejected(String userEmail, String bookingId,
                                       String resourceName, String reason) {
        sendNotification(userEmail,
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected ❌",
                "Your booking for \"" + resourceName + "\" was rejected. Reason: " + reason,
                bookingId,
                "/bookings/" + bookingId);
    }

    /** Convenience: notify about ticket status change */
    public void notifyTicketStatusChanged(String userEmail, String ticketId,
                                           String newStatus) {
        sendNotification(userEmail,
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated 🔧",
                "Your maintenance ticket status changed to: " + newStatus,
                ticketId,
                "/tickets/" + ticketId);
    }

    /** Convenience: notify about new comment on ticket */
    public void notifyTicketCommentAdded(String userEmail, String ticketId,
                                          String commenterName) {
        sendNotification(userEmail,
                NotificationType.TICKET_COMMENT_ADDED,
                "New Comment on Your Ticket 💬",
                commenterName + " added a comment on your ticket.",
                ticketId,
                "/tickets/" + ticketId);
    }

    // ── Maintenance Notifications (from Module G) ────────────────────────────

    public void sendTicketCreatedNotification(com.spacesync.entity.IncidentTicket ticket) {
        log.info("Ticket created notification logged: {}", ticket.getTitle());
        // In this implementation, we save a persistent notification for the reporter
        sendNotification(ticket.getReportedBy(), // Assuming reportedBy is email for now
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Created: " + ticket.getTitle(),
                "Your maintenance ticket has been created successfully.",
                ticket.getId().toString(),
                "/tickets/" + ticket.getId());
    }

    public void sendTicketAssignedNotification(com.spacesync.entity.IncidentTicket ticket) {
        if (ticket.getAssignedTo() != null) {
            sendNotification(ticket.getAssignedTo(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket Assigned: " + ticket.getTitle(),
                    "A maintenance ticket has been assigned to you.",
                    ticket.getId().toString(),
                    "/tickets/" + ticket.getId());
        }
    }

    public void sendTicketResolvedNotification(com.spacesync.entity.IncidentTicket ticket) {
        sendNotification(ticket.getReportedBy(),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Resolved: " + ticket.getTitle(),
                "Your maintenance ticket has been resolved.",
                ticket.getId().toString(),
                "/tickets/" + ticket.getId());
    }

    public void sendCriticalTicketAlert(com.spacesync.entity.IncidentTicket ticket) {
        log.warn("CRITICAL ALERT for Ticket ID {}: {}", ticket.getId(), ticket.getTitle());
        // Send to an admin or a specific email (mocked here as persistent notification for reportedBy too)
        sendNotification(ticket.getReportedBy(),
                NotificationType.TICKET_STATUS_CHANGED,
                "🚨 CRITICAL ALERT: " + ticket.getTitle(),
                "A critical priority ticket has been logged for your resource.",
                ticket.getId().toString(),
                "/tickets/" + ticket.getId());
    }

    public void notifyBasedOnTicket(com.spacesync.entity.IncidentTicket ticket) {
        if (ticket.getPriority() == com.spacesync.entity.TicketPriority.CRITICAL) {
            sendCriticalTicketAlert(ticket);
        }
        sendTicketCreatedNotification(ticket);
    }

    public void notifyAssignment(com.spacesync.entity.IncidentTicket ticket) {
        sendTicketAssignedNotification(ticket);
    }

    public void notifyResolution(com.spacesync.entity.IncidentTicket ticket) {
        sendTicketResolvedNotification(ticket);
    }

    /** Notify all admins about a new booking request */
    public void notifyAdminsAboutNewBooking(String bookingId, String resourceName, String userName) {
        List<User> admins = userRepository.findAllByRole(com.spacesync.user.Role.ADMIN);
        for (User admin : admins) {
            sendNotification(admin.getEmail(),
                    NotificationType.BKG_REQ,
                    "New Booking Request 📅",
                    userName + " has requested a booking for \"" + resourceName + "\".",
                    bookingId,
                    "/admin/bookings");
        }
    }
}
