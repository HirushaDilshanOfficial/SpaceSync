package backend.config;

import backend.entity.Booking;
import backend.entity.BookingStatus;
import backend.entity.Resource;
import backend.repository.BookingRepository;
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
    }
}
