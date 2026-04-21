package com.spacesync.controller;

import com.spacesync.dto.BookingRequestDTO;
import com.spacesync.dto.BookingResponseDTO;
import com.spacesync.entity.BookingStatus;
import com.spacesync.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        return new ResponseEntity<>(bookingService.createBooking(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@RequestParam String userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @GetMapping("/user/{userId}")
    @Deprecated // Replaced by /my for better RESTful approach on "My Booking" page
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @RequestParam(required = false) String rejectReason) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, rejectReason));
    }

    /**
     * Returns the QR code image (PNG) for a confirmed booking.
     * Student uses this to view/download their check-in QR code.
     *
     * GET /api/bookings/{id}/qr
     */
    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getBookingQrCode(@PathVariable Long id) {
        byte[] qrBytes = bookingService.getQrCodeBytes(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qrBytes.length);
        return new ResponseEntity<>(qrBytes, headers, HttpStatus.OK);
    }

    /**
     * Validates a QR token and marks the booking as CHECKED_IN.
     * Admin scans the QR and the token is submitted here.
     *
     * POST /api/bookings/check-in?token=<uuid>
     */
    @PostMapping("/check-in")
    public ResponseEntity<BookingResponseDTO> checkIn(@RequestParam String token) {
        return ResponseEntity.ok(bookingService.validateCheckIn(token));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
