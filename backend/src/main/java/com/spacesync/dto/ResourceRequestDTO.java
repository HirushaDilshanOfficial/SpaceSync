package com.spacesync.dto;

import com.spacesync.entity.ResourceStatus;
import com.spacesync.entity.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Building is required")
    @Size(max = 100, message = "Building must not exceed 100 characters")
    private String building;

    private String description;

    private String imageUrl;

    private ResourceStatus status;


    @NotNull(message = "Availability start time is required")
    private LocalTime availabilityStart;

    @NotNull(message = "Availability end time is required")
    private LocalTime availabilityEnd;
}