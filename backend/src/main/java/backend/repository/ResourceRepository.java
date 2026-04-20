package backend.repository;

import backend.entity.Resource;
import backend.enums.ResourceStatus;
import backend.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("""
        SELECT r FROM Resource r
        WHERE (:type IS NULL OR r.type = :type)
          AND (:status IS NULL OR r.status = :status)
          AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
        ORDER BY r.name ASC
    """)
    List<Resource> searchResources(
            @Param("type")        ResourceType type,
            @Param("status")      ResourceStatus status,
            @Param("location")    String location,
            @Param("minCapacity") Integer minCapacity
    );
}