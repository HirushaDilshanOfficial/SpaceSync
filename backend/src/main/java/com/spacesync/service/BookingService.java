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
    private final QrCodeService qrCodeService;

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

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        return mapToResponseDTO(bookingRepository.save(booking));
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
        if (status == BookingStatus.REJECTED && rejectReason != null) {
            booking.setRejectReason(rejectReason);
        }
        Booking updatedBooking = bookingRepository.save(booking);
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

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .userName("User " + booking.getUserId()) // Standardized mock for now
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
