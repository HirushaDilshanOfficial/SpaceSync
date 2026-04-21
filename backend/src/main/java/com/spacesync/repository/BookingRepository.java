package com.spacesync.repository;

import com.spacesync.entity.Booking;
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
    java.util.Optional<Booking> findByCheckInToken(String checkInToken);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resourceId = :resourceId AND b.status IN (com.spacesync.entity.BookingStatus.PENDING, com.spacesync.entity.BookingStatus.APPROVED, com.spacesync.entity.BookingStatus.CONFIRMED, com.spacesync.entity.BookingStatus.CHECKED_IN) " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime)")
    boolean hasConflict(@Param("resourceId") String resourceId, 
                        @Param("startTime") LocalDateTime startTime, 
                        @Param("endTime") LocalDateTime endTime);
}
