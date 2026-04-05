package backend.service;

import backend.dto.IncidentTicketRequestDTO;
import backend.dto.IncidentTicketResponseDTO;
import backend.entity.IncidentTicket;
import backend.entity.TicketStatus;
import backend.exception.ResourceNotFoundException;
import backend.repository.IncidentTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final backend.repository.ResourceRepository resourceRepository;

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
                .notes(request.getNotes())
                .build();

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
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

    @Transactional
    public IncidentTicketResponseDTO updateTicketStatus(Long id, TicketStatus status, String assignedTo) {
        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + id));

        ticket.setStatus(status);

        if (assignedTo != null) {
            ticket.setAssignedTo(assignedTo);
        }

        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        IncidentTicket updatedTicket = incidentTicketRepository.save(ticket);
        return mapToResponseDTO(updatedTicket);
    }

    @Transactional
    public IncidentTicketResponseDTO assignTicket(Long id, String assignedTo) {
        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + id));

        ticket.setAssignedTo(assignedTo);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        IncidentTicket updatedTicket = incidentTicketRepository.save(ticket);
        return mapToResponseDTO(updatedTicket);
    }

    @Transactional
    public void deleteIncidentTicket(Long id) {
        if (!incidentTicketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Incident ticket not found with id: " + id);
        }
        incidentTicketRepository.deleteById(id);
    }

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
                .map(backend.entity.Resource::getName)
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
                .notes(ticket.getNotes())
                .build();
    }
}