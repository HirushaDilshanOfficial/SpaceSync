package com.spacesync.notification;

/**
 * Types of notifications sent to users in the SpaceSync platform.
 *
 * @author Member 4 – Module D (Notifications)
 */
public enum NotificationType {

    /** Booking was approved by admin */
    BOOKING_APPROVED,

    /** Booking was rejected by admin */
    BOOKING_REJECTED,

    /** Booking was cancelled */
    BOOKING_CANCELLED,

    /** Maintenance ticket status changed */
    TICKET_STATUS_CHANGED,

    /** A new comment was posted on user's ticket */
    TICKET_COMMENT_ADDED,

    /** A technician has been assigned to the ticket */
    TICKET_ASSIGNED,

    /** General system / admin broadcast */
    SYSTEM
}
