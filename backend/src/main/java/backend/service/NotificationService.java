package backend.service;

import backend.entity.IncidentTicket;
import backend.entity.TicketPriority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    // In a real application, you would inject JavaMailSender or similar
    // For now, we'll just log the notifications

    public void sendTicketCreatedNotification(IncidentTicket ticket) {
        String subject = "New Maintenance Ticket Created: " + ticket.getTitle();
        String message = buildTicketNotificationMessage(ticket, "created");

        log.info("NOTIFICATION - To: maintenance@campus.edu, Subject: {}, Message: {}", subject, message);

        // In production, you would send actual email:
        // emailService.sendEmail("maintenance@campus.edu", subject, message);
    }

    public void sendTicketAssignedNotification(IncidentTicket ticket) {
        String subject = "Maintenance Ticket Assigned: " + ticket.getTitle();
        String message = buildTicketNotificationMessage(ticket, "assigned to you");

        log.info("NOTIFICATION - To: {}@campus.edu, Subject: {}, Message: {}", ticket.getAssignedTo(), subject, message);

        // In production:
        // emailService.sendEmail(ticket.getAssignedTo() + "@campus.edu", subject, message);
    }

    public void sendTicketResolvedNotification(IncidentTicket ticket) {
        String subject = "Maintenance Ticket Resolved: " + ticket.getTitle();
        String message = buildTicketNotificationMessage(ticket, "resolved");

        log.info("NOTIFICATION - To: {}@campus.edu, Subject: {}, Message: {}", ticket.getReportedBy(), subject, message);

        // In production:
        // emailService.sendEmail(ticket.getReportedBy() + "@campus.edu", subject, message);
    }

    public void sendCriticalTicketAlert(IncidentTicket ticket) {
        String subject = "🚨 CRITICAL: " + ticket.getTitle();
        String message = buildCriticalAlertMessage(ticket);

        log.warn("CRITICAL ALERT - To: maintenance@campus.edu, Subject: {}, Message: {}", subject, message);

        // In production:
        // emailService.sendEmail("maintenance@campus.edu", subject, message);
        // smsService.sendSMS("+1234567890", "CRITICAL: " + ticket.getTitle());
    }

    private String buildTicketNotificationMessage(IncidentTicket ticket, String action) {
        return String.format("""
            Dear Team,

            A maintenance ticket has been %s.

            Ticket Details:
            ID: %d
            Title: %s
            Priority: %s
            Type: %s
            Resource: %s
            Reported By: %s
            Description: %s

            Status: %s
            %s

            Please log in to the system to view full details.

            Best regards,
            SpaceSync System
            """,
            action,
            ticket.getId(),
            ticket.getTitle(),
            ticket.getPriority(),
            ticket.getTicketType(),
            ticket.getResourceId(),
            ticket.getReportedBy(),
            ticket.getDescription(),
            ticket.getStatus(),
            ticket.getAssignedTo() != null ? "Assigned To: " + ticket.getAssignedTo() : ""
        );
    }

    private String buildCriticalAlertMessage(IncidentTicket ticket) {
        return String.format("""
            🚨 CRITICAL MAINTENANCE ALERT 🚨

            A critical priority ticket requires immediate attention!

            Ticket Details:
            ID: %d
            Title: %s
            Resource: %s
            Reported By: %s
            Description: %s

            This ticket has been marked as CRITICAL priority and needs immediate response.

            Please assign a technician and begin work immediately.

            URGENT ACTION REQUIRED!
            """,
            ticket.getId(),
            ticket.getTitle(),
            ticket.getResourceId(),
            ticket.getReportedBy(),
            ticket.getDescription()
        );
    }

    public void notifyBasedOnTicket(IncidentTicket ticket) {
        // Send appropriate notifications based on ticket state
        if (ticket.getPriority() == TicketPriority.CRITICAL) {
            sendCriticalTicketAlert(ticket);
        }

        sendTicketCreatedNotification(ticket);
    }

    public void notifyAssignment(IncidentTicket ticket) {
        sendTicketAssignedNotification(ticket);
    }

    public void notifyResolution(IncidentTicket ticket) {
        sendTicketResolvedNotification(ticket);
    }
}