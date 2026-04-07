package backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceLogResponseDTO {
    private Long id;
    private Long ticketId;
    private String action;
    private String performedBy;
    private String performedByName;
    private String details;
    private LocalDateTime timestamp;
}