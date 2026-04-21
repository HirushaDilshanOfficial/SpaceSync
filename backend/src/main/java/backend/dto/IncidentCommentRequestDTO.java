package backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentCommentRequestDTO {

    @NotBlank(message = "Performed by is required")
    private String performedBy;

    @NotBlank(message = "Comment details are required")
    private String details;
}
