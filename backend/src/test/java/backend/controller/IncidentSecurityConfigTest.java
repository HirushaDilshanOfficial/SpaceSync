package backend.controller;

import backend.config.SecurityConfig;
import backend.dto.IncidentTicketResponseDTO;
import backend.entity.TicketPriority;
import backend.entity.TicketStatus;
import backend.entity.TicketType;
import backend.service.IncidentTicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = IncidentTicketController.class)
@Import(SecurityConfig.class)
class IncidentSecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IncidentTicketService incidentTicketService;

    @Test
    void getIncidents_ShouldReturnUnauthorized_WhenNoCredentials() throws Exception {
        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createIncident_ShouldAllowUserRole() throws Exception {
        IncidentTicketResponseDTO response = IncidentTicketResponseDTO.builder()
                .id(1L)
                .title("Printer not working")
                .description("Paper jam")
                .resourceId("R-PR-1")
                .priority(TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .ticketType(TicketType.INCIDENT)
                .reportedBy("user")
                .createdAt(LocalDateTime.now())
                .build();

        when(incidentTicketService.createIncidentTicket(any())).thenReturn(response);

        String payload = objectMapper.writeValueAsString(java.util.Map.of(
                "title", "Printer not working",
                "description", "Paper jam",
                "resourceId", "R-PR-1",
                "priority", "MEDIUM",
                "ticketType", "INCIDENT",
                "reportedBy", "user"
        ));

        mockMvc.perform(post("/api/incidents")
                        .with(httpBasic("user", "password"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());
    }

    @Test
    void updateStatus_ShouldForbidUserRole() throws Exception {
        mockMvc.perform(patch("/api/incidents/1/status")
                        .with(httpBasic("user", "password"))
                        .param("status", "IN_PROGRESS")
                        .param("performedBy", "user"))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateStatus_ShouldAllowTechnicianRole() throws Exception {
        IncidentTicketResponseDTO response = IncidentTicketResponseDTO.builder()
                .id(1L)
                .title("Projector issue")
                .description("Does not start")
                .resourceId("R-PROJ-1")
                .priority(TicketPriority.HIGH)
                .status(TicketStatus.IN_PROGRESS)
                .ticketType(TicketType.INCIDENT)
                .reportedBy("user")
                .build();

        when(incidentTicketService.updateTicketStatus(eq(1L), eq(TicketStatus.IN_PROGRESS), eq("tech")))
                .thenReturn(response);

        mockMvc.perform(patch("/api/incidents/1/status")
                        .with(httpBasic("tech", "password"))
                        .param("status", "IN_PROGRESS")
                        .param("performedBy", "tech"))
                .andExpect(status().isOk());
    }
}
