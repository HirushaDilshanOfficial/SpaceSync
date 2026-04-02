package backend.controller;

import backend.dto.BookingRequestDTO;
import backend.dto.BookingResponseDTO;
import backend.entity.BookingStatus;
import backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
