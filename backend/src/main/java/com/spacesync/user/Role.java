package com.spacesync.user;

/**
 * Roles available in the SpaceSync platform.
 * - USER      : Regular student/staff who can create bookings and raise tickets.
 * - ADMIN     : Can approve/reject bookings, assign technicians, manage resources.
 * - TECHNICIAN: Can update ticket status and add resolution notes.
 */
public enum Role {
    USER,
    ADMIN,
    TECHNICIAN
}
