package backend.entity;

import backend.enums.ResourceStatus;
import backend.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @UuidGenerator
    @Column(length = 255)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 100)
    private String building;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(name = "availability_start", nullable = false)
    @Builder.Default
    private LocalTime availabilityStart = LocalTime.of(8, 0);

    @Column(name = "availability_end", nullable = false)
    @Builder.Default
    private LocalTime availabilityEnd = LocalTime.of(18, 0);

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}