package com.spacesync.service;

import com.spacesync.entity.Booking;
import com.spacesync.entity.BookingStatus;
import com.spacesync.repository.BookingRepository;
import com.spacesync.user.User;
import com.spacesync.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingReminderService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final com.spacesync.repository.ResourceRepository resourceRepository;

    // Run every 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void sendBookingReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime timeIn30Mins = now.plusMinutes(30);
        LocalDateTime timeIn35Mins = now.plusMinutes(35); // 5 minutes window

        // Find all APPROVED or CONFIRMED bookings starting in 30-35 mins
        List<Booking> upcomingBookings = bookingRepository.findAll().stream()
                .filter(b -> (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.CONFIRMED))
                .filter(b -> b.getStartTime().isAfter(timeIn30Mins) && b.getStartTime().isBefore(timeIn35Mins))
                .toList();

        for (Booking booking : upcomingBookings) {
            User user = userRepository.findById(booking.getUserId()).orElse(null);

            if (user != null && user.getEmail() != null) {
                String userName = user.getName() != null ? user.getName() : "User";
                String resourceName = resourceRepository.findById(booking.getResourceId())
                        .map(com.spacesync.entity.Resource::getName)
                        .orElse(booking.getResourceId());
                String startStr = booking.getStartTime().toLocalTime().toString();

                String subject = "Reminder: Upcoming Booking in 30 Minutes";
                String htmlBody = emailTemplateService.buildReminderEmail(userName, resourceName, startStr);

                emailService.sendEmail(user.getEmail(), subject, htmlBody);
            }
        }
    }

    // Run every 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void sendBookingEndReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime timeIn15Mins = now.plusMinutes(15);
        LocalDateTime timeIn20Mins = now.plusMinutes(20);

        List<Booking> endingBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> b.getEndTime().isAfter(timeIn15Mins) && b.getEndTime().isBefore(timeIn20Mins))
                .toList();

        for (Booking booking : endingBookings) {
            User user = userRepository.findById(booking.getUserId()).orElse(null);
            if (user != null && user.getEmail() != null) {
                String userName = user.getName() != null ? user.getName() : "User";
                String resourceName = resourceRepository.findById(booking.getResourceId())
                        .map(com.spacesync.entity.Resource::getName)
                        .orElse(booking.getResourceId());
                String endStr = booking.getEndTime().toLocalTime().toString();

                String subject = "Reminder: Booking Ends in 15 Minutes";
                String htmlBody = emailTemplateService.buildEndReminderEmail(userName, resourceName, endStr);

                emailService.sendEmail(user.getEmail(), subject, htmlBody);
            }
        }
    }

    // Run every 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void autoCancelExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> expiredBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED && b.getStatus() != BookingStatus.CHECKED_OUT)
                .filter(b -> b.getEndTime().isBefore(now))
                .toList();

        for (Booking booking : expiredBookings) {
            if (booking.getStatus() == BookingStatus.CHECKED_IN) {
                // If they checked in, just check them out when time is over
                booking.setStatus(BookingStatus.CHECKED_OUT);
                bookingRepository.save(booking);
            } else {
                // If they never checked in, cancel it
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setRejectReason("Booking time period has ended automatically.");
                bookingRepository.save(booking);

                User user = userRepository.findById(booking.getUserId()).orElse(null);
                if (user != null && user.getEmail() != null) {
                    String userName = user.getName() != null ? user.getName() : "User";
                    String resourceName = resourceRepository.findById(booking.getResourceId())
                            .map(com.spacesync.entity.Resource::getName)
                            .orElse(booking.getResourceId());
                    String startTimeStr = booking.getStartTime().toString().replace("T", " ");
                    String endTimeStr = booking.getEndTime().toString().replace("T", " ");

                    String htmlBody = emailTemplateService.buildCancellationEmail(
                            userName, resourceName, startTimeStr, endTimeStr, booking.getRejectReason()
                    );
                    emailService.sendEmail(user.getEmail(), "Booking Auto-Cancelled - SpaceSync", htmlBody);
                }
            }
        }
    }
}
