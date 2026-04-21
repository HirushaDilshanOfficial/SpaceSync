package com.spacesync.service.impl;

import com.spacesync.dto.ResourceRequestDTO;
import com.spacesync.dto.ResourceResponseDTO;
import com.spacesync.entity.Resource;
import com.spacesync.entity.ResourceStatus;
import com.spacesync.entity.ResourceType;
import com.spacesync.exception.ResourceNotFoundException;
import com.spacesync.repository.ResourceRepository;
import com.spacesync.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    private ResourceResponseDTO toDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .building(r.getBuilding())
                .description(r.getDescription())
                .status(r.getStatus())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private void applyDTO(Resource resource, ResourceRequestDTO dto) {
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setBuilding(dto.getBuilding());
        resource.setDescription(dto.getDescription());
        resource.setStatus(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE);
        resource.setAvailabilityStart(dto.getAvailabilityStart());
        resource.setAvailabilityEnd(dto.getAvailabilityEnd());
    }

    @Override
    public List<ResourceResponseDTO> getAllResources(
            ResourceType type, ResourceStatus status,
            String location, Integer minCapacity) {

        return resourceRepository
                .searchResources(type, status, location, minCapacity)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return toDTO(resource);
    }

    @Override
    @Transactional
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = new Resource();
        applyDTO(resource, dto);
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        applyDTO(resource, dto);
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponseDTO updateResourceStatus(String id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        resource.setStatus(status);
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        resourceRepository.deleteById(id);
    }
}