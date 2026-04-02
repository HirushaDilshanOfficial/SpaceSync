package backend.controller;

import backend.dto.BookingResponseDTO;
import backend.entity.BookingStatus;
import backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        List<BookingResponseDTO> allBookings = bookingService.getAllBookings();
        
        long pendingCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();
        
        long approvedCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .count();
        
        long totalCount = allBookings.size();

        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", pendingCount);
        stats.put("approved", approvedCount);
        stats.put("total", totalCount);
        
        return ResponseEntity.ok(stats);
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @RequestParam(required = false) String rejectReason) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, rejectReason));
    }
}
