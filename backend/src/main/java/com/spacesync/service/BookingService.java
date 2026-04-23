package com.spacesync.service;

import com.spacesync.dto.BookingRequestDTO;
import com.spacesync.dto.BookingResponseDTO;
import com.spacesync.entity.Booking;
import com.spacesync.entity.BookingStatus;
import com.spacesync.exception.ResourceNotFoundException;
import com.spacesync.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final com.spacesync.repository.ResourceRepository resourceRepository;
    private final com.spacesync.repository.IncidentTicketRepository incidentTicketRepository;
    private final com.spacesync.user.UserRepository userRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final QrCodeService qrCodeService;
    private final com.spacesync.notification.NotificationService notificationService;

    public byte[] getQrCodeBytes(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        if (booking.getCheckInToken() == null) {
            booking.setCheckInToken(java.util.UUID.randomUUID().toString());
            bookingRepository.save(booking);
        }
        
        return qrCodeService.generateQrPng(booking.getCheckInToken());
    }

    @Transactional
    public BookingResponseDTO validateCheckIn(String token) {
        Booking booking = bookingRepository.findByCheckInToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid check-in token"));

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("Already checked in");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime earliestCheckInTime = booking.getStartTime().minusMinutes(10);
        
        if (now.isBefore(earliestCheckInTime)) {
            throw new IllegalStateException("Check-in is only allowed 10 minutes before the booking start time.");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        com.spacesync.user.User user = userRepository.findById(savedBooking.getUserId()).orElse(null);
        if (user != null && user.getEmail() != null) {
            String userName = user.getName() != null ? user.getName() : "User";
            String resourceName = resourceRepository.findById(savedBooking.getResourceId())
                    .map(com.spacesync.entity.Resource::getName)
                    .orElse(savedBooking.getResourceId());
            String checkInTime = savedBooking.getCheckedInAt().toString().replace("T", " ");
            
            String htmlBody = emailTemplateService.buildCheckInEmail(userName, resourceName, checkInTime);
            emailService.sendEmail(user.getEmail(), "Check-In Successful - SpaceSync", htmlBody);
        }

        return mapToResponseDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        if (!request.isValidTimeline()) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (bookingRepository.hasConflict(request.getResourceId(), request.getStartTime(), request.getEndTime())) {
            throw new IllegalStateException("Selected time slot is already booked or pending approval");
        }

        if (hasMaintenanceConflict(request.getResourceId(), request.getStartTime(), request.getEndTime())) {
            throw new IllegalStateException("Selected time slot conflicts with scheduled maintenance");
        }

        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .resourceId(request.getResourceId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Notify admins about new booking
        try {
            com.spacesync.user.User user = userRepository.findById(request.getUserId()).orElse(null);
            String userName = (user != null) ? user.getName() : "A user";
            String resourceName = resourceRepository.findById(request.getResourceId())
                    .map(com.spacesync.entity.Resource::getName)
                    .orElse(request.getResourceId());
            
            notificationService.notifyAdminsAboutNewBooking(savedBooking.getId().toString(), resourceName, userName);
        } catch (Exception e) {
            // Log error but don't fail booking creation
            System.err.println("Failed to send admin notification: " + e.getMessage());
        }

        return mapToResponseDTO(savedBooking);
    }

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponseDTO(booking);
    }

    public List<BookingResponseDTO> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatus status, String rejectReason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        booking.setStatus(status);
        if ((status == BookingStatus.REJECTED || status == BookingStatus.CANCELLED) && rejectReason != null) {
            booking.setRejectReason(rejectReason);
        }
        Booking updatedBooking = bookingRepository.save(booking);
        
        com.spacesync.user.User user = userRepository.findById(booking.getUserId()).orElse(null);

        if (user != null && user.getEmail() != null) {
            String userName = user.getName() != null ? user.getName() : "User";
            String startStr = booking.getStartTime().toString().replace("T", " ");
            String endStr = booking.getEndTime().toString().replace("T", " ");
            String resourceName = resourceRepository.findById(booking.getResourceId())
                .map(com.spacesync.entity.Resource::getName)
                .orElse(booking.getResourceId());

            if (status == BookingStatus.APPROVED) {
                String htmlBody = emailTemplateService.buildApprovalEmail(userName, resourceName, startStr, endStr);
                emailService.sendEmail(user.getEmail(), "Booking Approved - SpaceSync", htmlBody);
            } else if (status == BookingStatus.REJECTED) {
                String htmlBody = emailTemplateService.buildRejectionEmail(userName, resourceName, startStr, endStr, rejectReason);
                emailService.sendEmail(user.getEmail(), "Booking Rejected - SpaceSync", htmlBody);
            } else if (status == BookingStatus.CANCELLED) {
                String htmlBody = emailTemplateService.buildCancellationEmail(userName, resourceName, startStr, endStr, rejectReason);
                emailService.sendEmail(user.getEmail(), "Booking Cancelled - SpaceSync", htmlBody);
            }
        }

        return mapToResponseDTO(updatedBooking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        String resourceName = resourceRepository.findById(booking.getResourceId())
                .map(com.spacesync.entity.Resource::getName)
                .orElse("Unknown Resource");

        com.spacesync.user.User user = userRepository.findById(booking.getUserId()).orElse(null);
        String userName = user != null && user.getName() != null ? user.getName() : "Unknown User";
        String userEmail = user != null && user.getEmail() != null ? user.getEmail() : "";

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .userName(userName)
                .userEmail(userEmail)
                .resourceId(booking.getResourceId())
                .resourceName(resourceName)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .rejectReason(booking.getRejectReason())
                .checkInToken(booking.getCheckInToken())
                .checkedInAt(booking.getCheckedInAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private boolean hasMaintenanceConflict(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        List<com.spacesync.entity.IncidentTicket> maintenanceTickets = incidentTicketRepository.findMaintenanceForCalendar(startTime, endTime);
        return maintenanceTickets.stream()
                .filter(ticket -> ticket.getResourceId().equals(resourceId))
                .filter(ticket -> ticket.getScheduledStart() != null && ticket.getScheduledEnd() != null)
                .anyMatch(ticket ->
                    // Check if maintenance overlaps with booking time
                    (ticket.getScheduledStart().isBefore(endTime) && ticket.getScheduledEnd().isAfter(startTime))
                );
    }
}
