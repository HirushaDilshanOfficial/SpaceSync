package backend.dto;

import backend.entity.TicketPriority;
import backend.entity.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentTicketRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotNull(message = "Ticket type is required")
    private TicketType ticketType;

    @NotBlank(message = "Reported by is required")
    private String reportedBy;

    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;

    private String notes;
}