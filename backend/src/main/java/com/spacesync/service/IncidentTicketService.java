package com.spacesync.service;

import com.spacesync.dto.IncidentTicketRequestDTO;
import com.spacesync.dto.IncidentTicketResponseDTO;
import com.spacesync.dto.MaintenanceLogResponseDTO;
import com.spacesync.entity.IncidentTicket;
import com.spacesync.entity.MaintenanceLog;
import com.spacesync.entity.TicketPriority;
import com.spacesync.entity.TicketStatus;
import com.spacesync.entity.TicketType;
import com.spacesync.exception.ResourceNotFoundException;
import com.spacesync.notification.NotificationService;
import com.spacesync.repository.IncidentTicketRepository;
import com.spacesync.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final com.spacesync.repository.ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    @Transactional
    public IncidentTicketResponseDTO createIncidentTicket(IncidentTicketRequestDTO request) {
        IncidentTicket ticket = IncidentTicket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .resourceId(request.getResourceId())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .ticketType(request.getTicketType())
                .reportedBy(request.getReportedBy())
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .notes(request.getNotes())
                .build();

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);

        // Log the creation
        logAction(savedTicket.getId(), "CREATED", request.getReportedBy(),
                 "Ticket created with priority " + request.getPriority());

        // Send notifications
        notificationService.notifyBasedOnTicket(savedTicket);

        return mapToResponseDTO(savedTicket);
    }

    public List<IncidentTicketResponseDTO> getAllIncidentTickets() {
        return incidentTicketRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public IncidentTicketResponseDTO getIncidentTicketById(Long id) {
        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + id));
        return mapToResponseDTO(ticket);
    }

    public List<IncidentTicketResponseDTO> getIncidentTicketsByStatus(TicketStatus status) {
        return incidentTicketRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<IncidentTicketResponseDTO> getIncidentTicketsByReportedBy(String reportedBy) {
        return incidentTicketRepository.findByReportedBy(reportedBy).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<IncidentTicketResponseDTO> getIncidentTicketsByAssignedTo(String assignedTo) {
        return incidentTicketRepository.findByAssignedTo(assignedTo).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<IncidentTicketResponseDTO> getIncidentTicketsWithFilters(TicketStatus status, TicketPriority priority,
                                                                        TicketType ticketType, String resourceId,
                                                                        String assignedTo, String reportedBy,
                                                                        LocalDateTime startDate, LocalDateTime endDate,
                                                                        String searchText) {
        List<IncidentTicket> tickets = incidentTicketRepository.findWithFilters(status, priority, ticketType,
                                                                                resourceId, assignedTo, reportedBy,
                                                                                startDate, endDate, searchText);
        return tickets.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<IncidentTicketResponseDTO> getMaintenanceForCalendar(LocalDateTime startDate, LocalDateTime endDate) {
        List<IncidentTicket> tickets = incidentTicketRepository.findMaintenanceForCalendar(startDate, endDate);
        return tickets.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidentTicketResponseDTO updateTicketStatus(Long id, TicketStatus status, String performedBy) {
        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + id));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(status);

        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        IncidentTicket updatedTicket = incidentTicketRepository.save(ticket);

        // Log the status change
        logAction(id, "STATUS_CHANGED", performedBy != null ? performedBy : "SYSTEM",
                 "Status changed from " + oldStatus + " to " + status);

        // Send resolution notification if ticket was resolved
        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            notificationService.notifyResolution(updatedTicket);
        }

        return mapToResponseDTO(updatedTicket);
    }

    @Transactional
    public IncidentTicketResponseDTO assignTicket(Long id, String assignedTo) {
        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + id));

        String oldAssignee = ticket.getAssignedTo();
        ticket.setAssignedTo(assignedTo);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        IncidentTicket updatedTicket = incidentTicketRepository.save(ticket);

        // Log the assignment
        logAction(id, "ASSIGNED", assignedTo,
                 oldAssignee != null ? "Reassigned from " + oldAssignee : "Assigned to technician");

        // Send assignment notification
        notificationService.notifyAssignment(updatedTicket);

        return mapToResponseDTO(updatedTicket);
    }

    @Transactional
    public void deleteIncidentTicket(Long id) {
        if (!incidentTicketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Incident ticket not found with id: " + id);
        }
        incidentTicketRepository.deleteById(id);
    }

    // Enhanced Statistics
    public Map<String, Long> getTicketStatistics() {
        return Map.of(
            "open", incidentTicketRepository.countByStatus(TicketStatus.OPEN),
            "inProgress", incidentTicketRepository.countByStatus(TicketStatus.IN_PROGRESS),
            "resolved", incidentTicketRepository.countByStatus(TicketStatus.RESOLVED),
            "closed", incidentTicketRepository.countByStatus(TicketStatus.CLOSED),
            "total", incidentTicketRepository.count()
        );
    }

    public Map<String, Long> getPriorityStatistics() {
        return Map.of(
            "critical", incidentTicketRepository.countByPriority(TicketPriority.CRITICAL),
            "high", incidentTicketRepository.countByPriority(TicketPriority.HIGH),
            "medium", incidentTicketRepository.countByPriority(TicketPriority.MEDIUM),
            "low", incidentTicketRepository.countByPriority(TicketPriority.LOW)
        );
    }

    public Map<String, Object> getDashboardAnalytics() {
        long totalTickets = incidentTicketRepository.count();
        long openTickets = incidentTicketRepository.countByStatus(TicketStatus.OPEN);
        long resolvedThisMonth = incidentTicketRepository.findAll().stream()
                .filter(ticket -> ticket.getResolvedAt() != null &&
                        ticket.getResolvedAt().getMonth() == LocalDateTime.now().getMonth() &&
                        ticket.getResolvedAt().getYear() == LocalDateTime.now().getYear())
                .count();

        double avgResolutionTime = incidentTicketRepository.findAll().stream()
                .filter(ticket -> ticket.getResolvedAt() != null)
                .mapToLong(ticket -> java.time.Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours())
                .average()
                .orElse(0.0);

        return Map.of(
            "totalTickets", totalTickets,
            "openTickets", openTickets,
            "resolvedThisMonth", resolvedThisMonth,
            "avgResolutionTimeHours", Math.round(avgResolutionTime * 10.0) / 10.0,
            "resolutionRate", totalTickets > 0 ? Math.round((double) resolvedThisMonth / totalTickets * 100 * 10.0) / 10.0 : 0.0
        );
    }

    // Maintenance Log functionality
    public List<MaintenanceLogResponseDTO> getTicketLogs(Long ticketId) {
        return maintenanceLogRepository.findByTicketIdOrderByTimestampDesc(ticketId).stream()
                .map(this::mapLogToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<MaintenanceLogResponseDTO> getTechnicianLogs(String technicianId) {
        return maintenanceLogRepository.findByPerformedByOrderByTimestampDesc(technicianId).stream()
                .map(this::mapLogToResponseDTO)
                .collect(Collectors.toList());
    }

    private void logAction(Long ticketId, String action, String performedBy, String details) {
        MaintenanceLog log = MaintenanceLog.builder()
                .ticketId(ticketId)
                .action(action)
                .performedBy(performedBy)
                .details(details)
                .build();
        maintenanceLogRepository.save(log);
    }

    // Legacy methods for backward compatibility
    public long getOpenTicketsCount() {
        return incidentTicketRepository.countByStatus(TicketStatus.OPEN);
    }

    public long getInProgressTicketsCount() {
        return incidentTicketRepository.countByStatus(TicketStatus.IN_PROGRESS);
    }

    public long getResolvedTicketsCount() {
        return incidentTicketRepository.countByStatus(TicketStatus.RESOLVED);
    }

    private IncidentTicketResponseDTO mapToResponseDTO(IncidentTicket ticket) {
        String resourceName = resourceRepository.findById(ticket.getResourceId())
                .map(com.spacesync.entity.Resource::getName)
                .orElse("Unknown Resource");

        return IncidentTicketResponseDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .resourceId(ticket.getResourceId())
                .resourceName(resourceName)
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .ticketType(ticket.getTicketType())
                .assignedTo(ticket.getAssignedTo())
                .reportedBy(ticket.getReportedBy())
                .reportedByName("User " + ticket.getReportedBy()) // Standardized mock for now
                .createdAt(ticket.getCreatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .updatedAt(ticket.getUpdatedAt())
                .scheduledStart(ticket.getScheduledStart())
                .scheduledEnd(ticket.getScheduledEnd())
                .notes(ticket.getNotes())
                .build();
    }

    private MaintenanceLogResponseDTO mapLogToResponseDTO(MaintenanceLog log) {
        return MaintenanceLogResponseDTO.builder()
                .id(log.getId())
                .ticketId(log.getTicketId())
                .action(log.getAction())
                .performedBy(log.getPerformedBy())
                .performedByName("User " + log.getPerformedBy()) // Standardized mock for now
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build();
    }

    public byte[] exportToCSV(TicketStatus status, TicketPriority priority, TicketType ticketType,
                             String resourceId, String assignedTo, String reportedBy,
                             LocalDateTime startDate, LocalDateTime endDate, String searchText) throws IOException {
        List<IncidentTicket> tickets = incidentTicketRepository.findWithFilters(status, priority, ticketType,
                                                                                resourceId, assignedTo, reportedBy,
                                                                                startDate, endDate, searchText);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        com.opencsv.CSVWriter writer = new com.opencsv.CSVWriter(new java.io.OutputStreamWriter(outputStream));

        // Write header
        writer.writeNext(new String[]{"ID", "Title", "Description", "Resource ID", "Resource Name", "Priority",
                                    "Status", "Type", "Assigned To", "Reported By", "Created At", "Resolved At",
                                    "Scheduled Start", "Scheduled End", "Notes"});

        // Write data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (IncidentTicket ticket : tickets) {
            String resourceName = resourceRepository.findById(ticket.getResourceId())
                    .map(com.spacesync.entity.Resource::getName)
                    .orElse("Unknown Resource");

            writer.writeNext(new String[]{
                ticket.getId().toString(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getResourceId(),
                resourceName,
                ticket.getPriority().toString(),
                ticket.getStatus().toString(),
                ticket.getTicketType().toString(),
                ticket.getAssignedTo() != null ? ticket.getAssignedTo() : "",
                ticket.getReportedBy(),
                ticket.getCreatedAt().format(formatter),
                ticket.getResolvedAt() != null ? ticket.getResolvedAt().format(formatter) : "",
                ticket.getScheduledStart() != null ? ticket.getScheduledStart().format(formatter) : "",
                ticket.getScheduledEnd() != null ? ticket.getScheduledEnd().format(formatter) : "",
                ticket.getNotes() != null ? ticket.getNotes() : ""
            });
        }

        writer.close();
        return outputStream.toByteArray();
    }

    public byte[] exportToPDF(TicketStatus status, TicketPriority priority, TicketType ticketType,
                             String resourceId, String assignedTo, String reportedBy,
                             LocalDateTime startDate, LocalDateTime endDate, String searchText) throws IOException {
        List<IncidentTicket> tickets = incidentTicketRepository.findWithFilters(status, priority, ticketType,
                                                                                resourceId, assignedTo, reportedBy,
                                                                                startDate, endDate, searchText);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(outputStream);
        com.itextpdf.kernel.pdf.PdfDocument pdfDoc = new com.itextpdf.kernel.pdf.PdfDocument(writer);
        com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdfDoc);

        // Add title
        com.itextpdf.layout.element.Paragraph title = new com.itextpdf.layout.element.Paragraph("Incident Tickets Report")
                .setFontSize(20)
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER);
        document.add(title);
        document.add(new com.itextpdf.layout.element.Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
        document.add(new com.itextpdf.layout.element.Paragraph("Total Records: " + tickets.size()));
        document.add(new com.itextpdf.layout.element.Paragraph("\n"));

        // Create table
        float[] columnWidths = {50, 100, 150, 80, 80, 60, 60, 60, 80, 80};
        com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(columnWidths);

        // Add headers
        table.addHeaderCell("ID");
        table.addHeaderCell("Title");
        table.addHeaderCell("Resource");
        table.addHeaderCell("Priority");
        table.addHeaderCell("Status");
        table.addHeaderCell("Type");
        table.addHeaderCell("Assigned");
        table.addHeaderCell("Reported");
        table.addHeaderCell("Created");
        table.addHeaderCell("Resolved");

        // Add data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (IncidentTicket ticket : tickets) {
            String resourceName = resourceRepository.findById(ticket.getResourceId())
                    .map(com.spacesync.entity.Resource::getName)
                    .orElse("Unknown");

            table.addCell(ticket.getId().toString());
            table.addCell(ticket.getTitle().length() > 30 ? ticket.getTitle().substring(0, 27) + "..." : ticket.getTitle());
            table.addCell(resourceName);
            table.addCell(ticket.getPriority().toString());
            table.addCell(ticket.getStatus().toString());
            table.addCell(ticket.getTicketType().toString());
            table.addCell(ticket.getAssignedTo() != null ? ticket.getAssignedTo() : "Unassigned");
            table.addCell(ticket.getReportedBy());
            table.addCell(ticket.getCreatedAt().format(formatter));
            table.addCell(ticket.getResolvedAt() != null ? ticket.getResolvedAt().format(formatter) : "Open");
        }

        document.add(table);
        document.close();

        return outputStream.toByteArray();
    }
}