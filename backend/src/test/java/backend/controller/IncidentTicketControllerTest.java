package backend.controller;

import backend.dto.IncidentCommentRequestDTO;
import backend.dto.IncidentTicketResponseDTO;
import backend.dto.MaintenanceLogResponseDTO;
import backend.entity.TicketPriority;
import backend.entity.TicketStatus;
import backend.entity.TicketType;
import backend.service.IncidentTicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = IncidentTicketController.class)
@AutoConfigureMockMvc(addFilters = false)
class IncidentTicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IncidentTicketService incidentTicketService;

    @Test
    void reopenTicket_ShouldReturnUpdatedTicket() throws Exception {
        IncidentTicketResponseDTO response = IncidentTicketResponseDTO.builder()
                .id(10L)
                .title("Server room overheating")
                .description("Temperature above threshold")
                .resourceId("R-SRV-1")
                .priority(TicketPriority.CRITICAL)
                .status(TicketStatus.IN_PROGRESS)
                .ticketType(TicketType.INCIDENT)
                .reportedBy("USER-12")
                .createdAt(LocalDateTime.now().minusHours(4))
                .updatedAt(LocalDateTime.now())
                .build();

        when(incidentTicketService.reopenTicket(eq(10L), eq("TECH-1"), eq("Recheck cooling")))
                .thenReturn(response);

        mockMvc.perform(patch("/api/incidents/10/reopen")
                        .param("performedBy", "TECH-1")
                        .param("reason", "Recheck cooling"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void addTicketComment_ShouldReturnCreatedLogEntry() throws Exception {
        IncidentCommentRequestDTO request = IncidentCommentRequestDTO.builder()
                .performedBy("TECH-77")
                .details("Replaced the damaged network switch.")
                .build();

        MaintenanceLogResponseDTO response = MaintenanceLogResponseDTO.builder()
                .id(99L)
                .ticketId(10L)
                .action("COMMENTED")
                .performedBy("TECH-77")
                .details("Replaced the damaged network switch.")
                .timestamp(LocalDateTime.now())
                .build();

        when(incidentTicketService.addTicketComment(eq(10L), eq("TECH-77"), eq("Replaced the damaged network switch.")))
                .thenReturn(response);

        mockMvc.perform(post("/api/incidents/10/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.action").value("COMMENTED"))
                .andExpect(jsonPath("$.performedBy").value("TECH-77"));
    }

    @Test
    void addTicketComment_ShouldFailValidation_WhenDetailsMissing() throws Exception {
        IncidentCommentRequestDTO request = IncidentCommentRequestDTO.builder()
                .performedBy("TECH-77")
                .details("   ")
                .build();

        mockMvc.perform(post("/api/incidents/10/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.details").exists());
    }
}
