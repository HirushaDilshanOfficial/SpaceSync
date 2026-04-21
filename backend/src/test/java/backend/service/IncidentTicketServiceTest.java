package backend.service;

import backend.dto.IncidentTicketRequestDTO;
import backend.entity.IncidentTicket;
import backend.entity.TicketPriority;
import backend.entity.TicketStatus;
import backend.entity.TicketType;
import backend.exception.ResourceNotFoundException;
import backend.repository.IncidentTicketRepository;
import backend.repository.MaintenanceLogRepository;
import backend.repository.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentTicketServiceTest {

    @Mock
    private IncidentTicketRepository incidentTicketRepository;

    @Mock
    private MaintenanceLogRepository maintenanceLogRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private IncidentTicketService incidentTicketService;

    @Test
    void createIncidentTicket_ShouldRejectMaintenanceWithoutSchedule() {
        IncidentTicketRequestDTO request = IncidentTicketRequestDTO.builder()
                .title("Lab AC Failure")
                .description("AC not working")
                .resourceId("R-1")
                .priority(TicketPriority.HIGH)
                .ticketType(TicketType.MAINTENANCE)
                .reportedBy("TECH-1")
                .build();

        assertThrows(IllegalArgumentException.class, () -> incidentTicketService.createIncidentTicket(request));
        verify(incidentTicketRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void createIncidentTicket_ShouldRejectOverlappingMaintenanceSchedule() {
        IncidentTicketRequestDTO request = IncidentTicketRequestDTO.builder()
                .title("Lab AC Maintenance")
                .description("Routine maintenance")
                .resourceId("R-1")
                .priority(TicketPriority.MEDIUM)
                .ticketType(TicketType.MAINTENANCE)
                .reportedBy("TECH-1")
                .scheduledStart(LocalDateTime.now().plusDays(1))
                .scheduledEnd(LocalDateTime.now().plusDays(1).plusHours(2))
                .build();

        when(incidentTicketRepository.existsOverlappingMaintenanceSchedule(
                org.mockito.ArgumentMatchers.eq("R-1"),
                org.mockito.ArgumentMatchers.any(LocalDateTime.class),
                org.mockito.ArgumentMatchers.any(LocalDateTime.class),
                org.mockito.ArgumentMatchers.isNull()
        )).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> incidentTicketService.createIncidentTicket(request));
        verify(incidentTicketRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void updateTicketStatus_ShouldRejectInvalidTransition() {
        IncidentTicket ticket = IncidentTicket.builder()
                .id(1L)
                .title("Projector issue")
                .description("Projector not turning on")
                .resourceId("R-2")
                .priority(TicketPriority.HIGH)
                .ticketType(TicketType.INCIDENT)
                .reportedBy("USER-1")
                .status(TicketStatus.OPEN)
                .build();

        when(incidentTicketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThrows(IllegalStateException.class,
                () -> incidentTicketService.updateTicketStatus(1L, TicketStatus.RESOLVED, "TECH-1"));
    }

    @Test
    void reopenTicket_ShouldRejectNonClosedOrResolvedStatus() {
        IncidentTicket ticket = IncidentTicket.builder()
                .id(2L)
                .title("Speaker issue")
                .description("No audio")
                .resourceId("R-3")
                .priority(TicketPriority.MEDIUM)
                .ticketType(TicketType.INCIDENT)
                .reportedBy("USER-1")
                .status(TicketStatus.OPEN)
                .build();

        when(incidentTicketRepository.findById(2L)).thenReturn(Optional.of(ticket));

        assertThrows(IllegalStateException.class,
                () -> incidentTicketService.reopenTicket(2L, "TECH-2", "Needs more work"));
    }

    @Test
    void addTicketComment_ShouldRejectUnknownTicket() {
        when(incidentTicketRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> incidentTicketService.addTicketComment(999L, "TECH-1", "Checked wiring"));
    }

    @Test
    void getDashboardAnalytics_ShouldIncludeOverdueAndSlaMetrics() {
        LocalDateTime now = LocalDateTime.now();
        IncidentTicket overdueOpen = IncidentTicket.builder()
                .id(1L)
                .title("Critical outage")
                .description("Network down")
                .resourceId("R-1")
                .priority(TicketPriority.CRITICAL)
                .ticketType(TicketType.INCIDENT)
                .reportedBy("USER-1")
                .status(TicketStatus.OPEN)
                .createdAt(now.minusHours(10))
                .build();

        IncidentTicket breachedResolved = IncidentTicket.builder()
                .id(2L)
                .title("High priority HVAC")
                .description("Cooling issue")
                .resourceId("R-2")
                .priority(TicketPriority.HIGH)
                .ticketType(TicketType.MAINTENANCE)
                .reportedBy("USER-2")
                .status(TicketStatus.RESOLVED)
                .createdAt(now.minusHours(30))
                .resolvedAt(now.minusHours(10))
                .build();

        IncidentTicket onTimeResolved = IncidentTicket.builder()
                .id(3L)
                .title("Low priority light")
                .description("Replace bulb")
                .resourceId("R-3")
                .priority(TicketPriority.LOW)
                .ticketType(TicketType.REPAIR)
                .reportedBy("USER-3")
                .status(TicketStatus.RESOLVED)
                .createdAt(now.minusHours(20))
                .resolvedAt(now.minusHours(1))
                .build();

        when(incidentTicketRepository.findAll()).thenReturn(List.of(overdueOpen, breachedResolved, onTimeResolved));

        Map<String, Object> analytics = incidentTicketService.getDashboardAnalytics();

        assertEquals(1L, analytics.get("overdueTickets"));
        assertEquals(1L, analytics.get("breachedResolvedTickets"));
        assertEquals(50.0, analytics.get("slaComplianceRate"));
    }
}
