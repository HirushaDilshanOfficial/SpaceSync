package backend.config;

import backend.entity.Booking;
import backend.entity.BookingStatus;
import backend.entity.IncidentTicket;
import backend.entity.Resource;
import backend.entity.TicketPriority;
import backend.entity.TicketStatus;
import backend.entity.TicketType;
import backend.repository.BookingRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
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

    @Override
    public void run(String... args) {
        if (resourceRepository.count() == 0) {
            Resource res1 = Resource.builder()
                    .id("CONF-RM-A")
                    .name("Conference Room A")
                    .type("ROOM")
                    .capacity(10)
                    .location("Floor 1, Wing B")
                    .build();

            Resource res2 = Resource.builder()
                    .id("PROJ-XYZ")
                    .name("Projector XYZ")
                    .type("EQUIPMENT")
                    .location("Media Storage")
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
    }
}
