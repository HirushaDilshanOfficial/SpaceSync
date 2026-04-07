package backend.controller;

import backend.dto.IncidentTicketRequestDTO;
import backend.dto.IncidentTicketResponseDTO;
import backend.dto.MaintenanceLogResponseDTO;
import backend.entity.TicketStatus;
import backend.entity.TicketPriority;
import backend.entity.TicketType;
import backend.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
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

    @GetMapping("/filter")
    public ResponseEntity<List<IncidentTicketResponseDTO>> getIncidentTicketsWithFilters(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketType ticketType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String reportedBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String searchText) {
        return ResponseEntity.ok(incidentTicketService.getIncidentTicketsWithFilters(
                status, priority, ticketType, resourceId, assignedTo, reportedBy, startDate, endDate, searchText));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<IncidentTicketResponseDTO>> getMaintenanceForCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(incidentTicketService.getMaintenanceForCalendar(startDate, endDate));
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
        return ResponseEntity.ok(incidentTicketService.getTicketStatistics());
    }

    @GetMapping("/stats/priority")
    public ResponseEntity<Map<String, Long>> getPriorityStats() {
        return ResponseEntity.ok(incidentTicketService.getPriorityStatistics());
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        return ResponseEntity.ok(incidentTicketService.getDashboardAnalytics());
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<MaintenanceLogResponseDTO>> getTicketLogs(@PathVariable Long id) {
        return ResponseEntity.ok(incidentTicketService.getTicketLogs(id));
    }

    @GetMapping("/logs/technician")
    public ResponseEntity<List<MaintenanceLogResponseDTO>> getTechnicianLogs(@RequestParam String technicianId) {
        return ResponseEntity.ok(incidentTicketService.getTechnicianLogs(technicianId));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportToCSV(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketType ticketType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String reportedBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String searchText) throws IOException {

        byte[] csvData = incidentTicketService.exportToCSV(status, priority, ticketType, resourceId,
                                                         assignedTo, reportedBy, startDate, endDate, searchText);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "incident_tickets.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportToPDF(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketType ticketType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String reportedBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String searchText) throws IOException {

        byte[] pdfData = incidentTicketService.exportToPDF(status, priority, ticketType, resourceId,
                                                         assignedTo, reportedBy, startDate, endDate, searchText);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "incident_tickets.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfData);
    }
}