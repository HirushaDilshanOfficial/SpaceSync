package backend.service;

import backend.dto.ResourceRequestDTO;
import backend.dto.ResourceResponseDTO;
import backend.enums.ResourceStatus;
import backend.enums.ResourceType;

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