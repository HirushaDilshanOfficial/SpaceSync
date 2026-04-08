package com.spacesync.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository for Notification entity.
 *
 * @author Member 4 – Module D (Notifications)
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    /** All notifications for a user, newest first */
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String userId);

    /** Unread notifications for a user */
    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(String userId);

    /** Count of unread notifications for a user */
    long countByRecipientIdAndReadFalse(String userId);

    /** Mark all unread as read for a user */
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :userId AND n.read = false")
    int markAllReadByUserId(@Param("userId") String userId);
}
