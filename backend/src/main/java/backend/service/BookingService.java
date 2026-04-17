package backend.service;

import backend.dto.BookingRequestDTO;
import backend.dto.BookingResponseDTO;
import backend.entity.Booking;
import backend.entity.BookingStatus;
import backend.exception.ResourceNotFoundException;
import backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final QrCodeService qrCodeService;

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        if (!request.isValidTimeline()) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .resourceId(request.getResourceId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
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

    /**
     * Updates booking status.
     * When status is set to CONFIRMED or APPROVED, automatically generates a unique QR check-in token.
     */
    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(status);

        // Auto-generate QR token when admin confirms or approves the booking
        if ((status == BookingStatus.CONFIRMED || status == BookingStatus.APPROVED) && booking.getCheckInToken() == null) {
            booking.setCheckInToken(UUID.randomUUID().toString());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    /**
     * Returns the PNG QR code image bytes for a given booking.
     * Booking must be CONFIRMED, APPROVED or CHECKED_IN to have a token.
     */
    public byte[] getQrCodeBytes(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getCheckInToken() == null) {
            throw new IllegalStateException("QR code not available. Booking is not yet confirmed/approved.");
        }

        return qrCodeService.generateQrPng(booking.getCheckInToken());
    }

    /**
     * Validates a check-in token scanned by QR and marks the booking as CHECKED_IN.
     */
    @Transactional
    public BookingResponseDTO validateCheckIn(String token) {
        Booking booking = bookingRepository.findByCheckInToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR token. No booking found."));

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("This booking has already been checked in.");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Cannot check in. Booking status is: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
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
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .resourceId(booking.getResourceId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .checkInToken(booking.getCheckInToken())
                .checkedInAt(booking.getCheckedInAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
