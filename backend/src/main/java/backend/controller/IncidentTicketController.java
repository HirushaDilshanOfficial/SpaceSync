package backend.controller;

import backend.dto.IncidentTicketRequestDTO;
import backend.dto.IncidentTicketResponseDTO;
import backend.entity.TicketStatus;
import backend.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    @PostMapping
    public ResponseEntity<IncidentTicketResponseDTO> createIncidentTicket(@Valid @RequestBody IncidentTicketRequestDTO request) {
        return new ResponseEntity<>(incidentTicketService.createIncidentTicket(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicketResponseDTO>> getAllIncidentTickets() {
        return ResponseEntity.ok(incidentTicketService.getAllIncidentTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicketResponseDTO> getIncidentTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentTicketService.getIncidentTicketById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IncidentTicketResponseDTO>> getIncidentTicketsByStatus(@PathVariable TicketStatus status) {
        return ResponseEntity.ok(incidentTicketService.getIncidentTicketsByStatus(status));
    }

    @GetMapping("/reported-by")
    public ResponseEntity<List<IncidentTicketResponseDTO>> getIncidentTicketsByReportedBy(@RequestParam String userId) {
        return ResponseEntity.ok(incidentTicketService.getIncidentTicketsByReportedBy(userId));
    }

    @GetMapping("/assigned-to")
    public ResponseEntity<List<IncidentTicketResponseDTO>> getIncidentTicketsByAssignedTo(@RequestParam String userId) {
        return ResponseEntity.ok(incidentTicketService.getIncidentTicketsByAssignedTo(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String assignedTo) {
        return ResponseEntity.ok(incidentTicketService.updateTicketStatus(id, status, assignedTo));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<IncidentTicketResponseDTO> assignTicket(
            @PathVariable Long id,
            @RequestParam String assignedTo) {
        return ResponseEntity.ok(incidentTicketService.assignTicket(id, assignedTo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncidentTicket(@PathVariable Long id) {
        incidentTicketService.deleteIncidentTicket(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getIncidentStats() {
        return ResponseEntity.ok(Map.of(
            "open", incidentTicketService.getOpenTicketsCount(),
            "inProgress", incidentTicketService.getInProgressTicketsCount(),
            "resolved", incidentTicketService.getResolvedTicketsCount()
        ));
    }
}