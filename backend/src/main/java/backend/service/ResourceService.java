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

    ResourceResponseDTO getResourceById(Long id);

    ResourceResponseDTO createResource(ResourceRequestDTO dto);

    ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto);

    ResourceResponseDTO updateResourceStatus(Long id, ResourceStatus status);

    void deleteResource(Long id);
}