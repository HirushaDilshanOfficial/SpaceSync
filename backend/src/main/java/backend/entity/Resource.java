package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id; // e.g., "CONF-RM-A"

    @Column(nullable = false)
    private String name; // e.g., "Conference Room A"

    @Column(nullable = false)
    private String type; // e.g., "ROOM", "EQUIPMENT"

    private String location;

    private Integer capacity;

    private String description;
}
