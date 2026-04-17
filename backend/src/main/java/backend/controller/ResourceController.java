package backend.controller;

import backend.entity.Resource;
import backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
}
