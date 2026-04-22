package com.spacesync.dto;

import com.spacesync.entity.ResourceStatus;
import com.spacesync.entity.ResourceType;
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
    private String imageUrl;
    private ResourceStatus status;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}