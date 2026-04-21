package backend.repository;

import backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findByResourceId(String resourceId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resourceId = :resourceId AND b.status = backend.entity.BookingStatus.APPROVED " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime)")
    boolean hasApprovedConflict(@Param("resourceId") String resourceId, 
                                @Param("startTime") LocalDateTime startTime, 
                                @Param("endTime") LocalDateTime endTime);
}
