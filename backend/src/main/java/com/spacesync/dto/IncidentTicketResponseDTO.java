package com.spacesync.dto;

import com.spacesync.entity.TicketPriority;
import com.spacesync.entity.TicketStatus;
import com.spacesync.entity.TicketType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentTicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String resourceId;
    private String resourceName;
    private TicketPriority priority;
    private TicketStatus status;
    private TicketType ticketType;
    private String assignedTo;
    private String reportedBy;
    private String reportedByName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String notes;
}