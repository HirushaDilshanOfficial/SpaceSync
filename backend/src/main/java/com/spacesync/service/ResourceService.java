package com.spacesync.service;

import com.spacesync.dto.ResourceRequestDTO;
import com.spacesync.dto.ResourceResponseDTO;
import com.spacesync.entity.ResourceStatus;
import com.spacesync.entity.ResourceType;

import java.util.List;

public interface ResourceService {

    List<ResourceResponseDTO> getAllResources(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity
    );

    ResourceResponseDTO getResourceById(String id);

    ResourceResponseDTO createResource(ResourceRequestDTO dto);

    ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto);

    ResourceResponseDTO updateResourceStatus(String id, ResourceStatus status);

    void deleteResource(String id);
}