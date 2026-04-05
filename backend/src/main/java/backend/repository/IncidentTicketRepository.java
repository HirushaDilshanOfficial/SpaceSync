package backend.repository;

import backend.entity.IncidentTicket;
import backend.entity.TicketPriority;
import backend.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findByStatus(TicketStatus status);
    List<IncidentTicket> findByPriority(TicketPriority priority);
    List<IncidentTicket> findByResourceId(String resourceId);
    List<IncidentTicket> findByReportedBy(String reportedBy);
    List<IncidentTicket> findByAssignedTo(String assignedTo);
    List<IncidentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    @Query("SELECT COUNT(t) FROM IncidentTicket t WHERE t.status = :status")
    long countByStatus(TicketStatus status);

    @Query("SELECT COUNT(t) FROM IncidentTicket t WHERE t.priority = :priority")
    long countByPriority(TicketPriority priority);
}