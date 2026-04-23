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
        // Dummy data initialization disabled for real data entry
    }
}
