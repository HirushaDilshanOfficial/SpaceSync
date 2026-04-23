package com.spacesync.controller;

import com.spacesync.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/bookings")
    public ResponseEntity<?> downloadBookingsReport(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String search) {
        try {
            System.out.println(">>> ReportController: Starting Bookings Report...");
            byte[] pdf = reportService.generateBookingsReport(status, date, search);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=SpaceSync-Bookings-Report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            System.err.println(">>> ReportController Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error generating bookings report: " + e.getMessage());
        }
    }

    @GetMapping("/resources")
    public ResponseEntity<?> downloadResourcesReport(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location) {
        try {
            System.out.println(">>> ReportController: Starting Resources Report...");
            byte[] pdf = reportService.generateResourcesReport(type, status, location);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=SpaceSync-Resources-Report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            System.err.println(">>> ReportController Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error generating resources report: " + e.getMessage());
        }
    }
}
