package com.spacesync.config;

import com.spacesync.entity.Booking;
import com.spacesync.entity.BookingStatus;
import com.spacesync.entity.IncidentTicket;
import com.spacesync.entity.MaintenanceLog;
import com.spacesync.entity.Resource;
import com.spacesync.entity.ResourceType;
import com.spacesync.entity.TicketPriority;
import com.spacesync.entity.TicketStatus;
import com.spacesync.entity.TicketType;
import com.spacesync.repository.BookingRepository;
import com.spacesync.repository.IncidentTicketRepository;
import com.spacesync.repository.MaintenanceLogRepository;
import com.spacesync.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    @Override
    public void run(String... args) {
        if (resourceRepository.count() == 0) {
            Resource res1 = Resource.builder()
                    .id("CONF-RM-A")
                    .name("Conference Room A")
                    .type(ResourceType.ROOM)
                    .capacity(10)
                    .location("Floor 1, Wing B")
                    .building("Main Building")
                    .build();

            Resource res2 = Resource.builder()
                    .id("PROJ-XYZ")
                    .name("Projector XYZ")
                    .type(ResourceType.EQUIPMENT)
                    .location("Media Storage")
                    .building("Main Building")
                    .build();

            resourceRepository.saveAll(Arrays.asList(res1, res2));
        }

        if (bookingRepository.count() == 0) {
            Booking b1 = Booking.builder()
                    .userId("USER-001")
                    .resourceId("CONF-RM-A")
                    .startTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0))
                    .purpose("Quarterly Planning")
                    .attendees(8)
                    .status(BookingStatus.APPROVED)
                    .build();

            Booking b2 = Booking.builder()
                    .userId("USER-002")
                    .resourceId("PROJ-XYZ")
                    .startTime(LocalDateTime.now().plusDays(2).withHour(13).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(2).withHour(15).withMinute(0))
                    .purpose("Client Presentation")
                    .attendees(12)
                    .status(BookingStatus.PENDING)
                    .build();

            bookingRepository.saveAll(Arrays.asList(b1, b2));
        }

        if (incidentTicketRepository.count() == 0) {
            IncidentTicket t1 = IncidentTicket.builder()
                    .title("Projector not working")
                    .description("The projector in Conference Room A is not displaying properly. Screen shows no signal.")
                    .resourceId("PROJ-XYZ")
                    .priority(TicketPriority.HIGH)
                    .status(TicketStatus.OPEN)
                    .ticketType(TicketType.REPAIR)
                    .reportedBy("USER-001")
                    .notes("Reported during morning meeting")
                    .build();

            IncidentTicket t2 = IncidentTicket.builder()
                    .title("Air conditioning maintenance")
                    .description("Conference Room A air conditioning needs scheduled maintenance check.")
                    .resourceId("CONF-RM-A")
                    .priority(TicketPriority.MEDIUM)
                    .status(TicketStatus.IN_PROGRESS)
                    .ticketType(TicketType.MAINTENANCE)
                    .reportedBy("USER-002")
                    .assignedTo("TECH-001")
                    .scheduledStart(LocalDateTime.now().plusDays(7).withHour(9).withMinute(0))
                    .scheduledEnd(LocalDateTime.now().plusDays(7).withHour(11).withMinute(0))
                    .notes("Scheduled for next week")
                    .build();

            IncidentTicket t3 = IncidentTicket.builder()
                    .title("WiFi connectivity issues")
                    .description("Intermittent WiFi connection in Conference Room A affecting presentations.")
                    .resourceId("CONF-RM-A")
                    .priority(TicketPriority.CRITICAL)
                    .status(TicketStatus.RESOLVED)
                    .ticketType(TicketType.INCIDENT)
                    .reportedBy("USER-001")
                    .assignedTo("TECH-002")
                    .resolvedAt(LocalDateTime.now().minusDays(1))
                    .notes("Router replaced, issue resolved")
                    .build();

            incidentTicketRepository.saveAll(Arrays.asList(t1, t2, t3));
        }

        if (maintenanceLogRepository.count() == 0) {
            // Assuming the tickets are saved and we have their IDs, we'll create logs
            // In a real scenario, you'd get the actual IDs after saving
            MaintenanceLog l1 = MaintenanceLog.builder()
                    .ticketId(1L) // WiFi issue - resolved
                    .action("CREATED")
                    .performedBy("USER-001")
                    .details("Ticket created with priority CRITICAL")
                    .timestamp(LocalDateTime.now().minusDays(2))
                    .build();

            MaintenanceLog l2 = MaintenanceLog.builder()
                    .ticketId(1L)
                    .action("ASSIGNED")
                    .performedBy("TECH-002")
                    .details("Assigned to technician")
                    .timestamp(LocalDateTime.now().minusDays(2).plusHours(1))
                    .build();

            MaintenanceLog l3 = MaintenanceLog.builder()
                    .ticketId(1L)
                    .action("STATUS_CHANGED")
                    .performedBy("TECH-002")
                    .details("Status changed from OPEN to RESOLVED")
                    .timestamp(LocalDateTime.now().minusDays(1))
                    .build();

            MaintenanceLog l4 = MaintenanceLog.builder()
                    .ticketId(2L) // AC maintenance - in progress
                    .action("CREATED")
                    .performedBy("USER-002")
                    .details("Ticket created with priority MEDIUM")
                    .timestamp(LocalDateTime.now().minusDays(5))
                    .build();

            MaintenanceLog l5 = MaintenanceLog.builder()
                    .ticketId(2L)
                    .action("ASSIGNED")
                    .performedBy("TECH-001")
                    .details("Assigned to technician")
                    .timestamp(LocalDateTime.now().minusDays(4))
                    .build();

            MaintenanceLog l6 = MaintenanceLog.builder()
                    .ticketId(2L)
                    .action("STATUS_CHANGED")
                    .performedBy("TECH-001")
                    .details("Status changed from OPEN to IN_PROGRESS")
                    .timestamp(LocalDateTime.now().minusDays(4).plusHours(2))
                    .build();

            maintenanceLogRepository.saveAll(Arrays.asList(l1, l2, l3, l4, l5, l6));
        }
    }
}
