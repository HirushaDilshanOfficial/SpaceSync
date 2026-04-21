package backend.dto;

import backend.enums.ResourceStatus;
import backend.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class ResourceResponseDTO {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String building;
    private String description;
    private ResourceStatus status;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}