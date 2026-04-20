package com.spacesync.repository;

import com.spacesync.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findByResourceId(String resourceId);
    Optional<Booking> findByCheckInToken(String checkInToken);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
            "AND b.status NOT IN (com.spacesync.entity.BookingStatus.CANCELLED, com.spacesync.entity.BookingStatus.REJECTED) " +
            "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(String resourceId, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime);
}
