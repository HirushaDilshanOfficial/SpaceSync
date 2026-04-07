package backend.repository;

import backend.entity.IncidentTicket;
import backend.entity.TicketPriority;
import backend.entity.TicketStatus;
import backend.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query("SELECT t FROM IncidentTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:ticketType IS NULL OR t.ticketType = :ticketType) AND " +
           "(:resourceId IS NULL OR t.resourceId = :resourceId) AND " +
           "(:assignedTo IS NULL OR t.assignedTo = :assignedTo) AND " +
           "(:reportedBy IS NULL OR t.reportedBy = :reportedBy) AND " +
           "(:startDate IS NULL OR t.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.createdAt <= :endDate) AND " +
           "(:searchText IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :searchText, '%')))")
    List<IncidentTicket> findWithFilters(@Param("status") TicketStatus status,
                                        @Param("priority") TicketPriority priority,
                                        @Param("ticketType") TicketType ticketType,
                                        @Param("resourceId") String resourceId,
                                        @Param("assignedTo") String assignedTo,
                                        @Param("reportedBy") String reportedBy,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate,
                                        @Param("searchText") String searchText);

    @Query("SELECT t FROM IncidentTicket t WHERE t.ticketType = backend.entity.TicketType.MAINTENANCE " +
           "AND t.scheduledStart IS NOT NULL AND t.scheduledEnd IS NOT NULL " +
           "AND ((t.scheduledStart <= :endDate AND t.scheduledEnd >= :startDate))")
    List<IncidentTicket> findMaintenanceForCalendar(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}