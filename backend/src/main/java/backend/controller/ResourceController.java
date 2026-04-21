package backend.controller;

import backend.dto.ResourceRequestDTO;
import backend.dto.ResourceResponseDTO;
import backend.enums.ResourceStatus;
import backend.enums.ResourceType;
import backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/v1/resources?type=LAB&status=ACTIVE&location=Block A&minCapacity=20
    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {

        return ResponseEntity.ok(
                resourceService.getAllResources(type, status, location, minCapacity)
        );
    }

    // GET /api/v1/resources/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/v1/resources
    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto));
    }

    // PUT /api/v1/resources/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // PATCH /api/v1/resources/{id}/status  body: { "status": "OUT_OF_SERVICE" }
    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        ResourceStatus status = ResourceStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    // DELETE /api/v1/resources/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }
}