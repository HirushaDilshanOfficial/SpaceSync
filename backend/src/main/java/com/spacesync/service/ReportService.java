package com.spacesync.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.spacesync.entity.Booking;
import com.spacesync.entity.Resource;
import com.spacesync.repository.BookingRepository;
import com.spacesync.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    private static final Color SLIIT_NAVY = new Color(0, 48, 135);
    private static final Color SLIIT_GOLD = new Color(245, 168, 0);

    public byte[] generateBookingsReport(String status, String date, String search) {
        List<Booking> bookings = bookingRepository.findAll();
        
        bookings = bookings.stream().filter(b -> {
            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                String bStatus = String.valueOf(b.getStatus());
                if (status.equals("APPROVED") && !(bStatus.equals("APPROVED") || bStatus.equals("CONFIRMED"))) return false;
                if (status.equals("DECLINED") && !(bStatus.equals("REJECTED") || bStatus.equals("CANCELLED"))) return false;
                if (!status.equals("APPROVED") && !status.equals("DECLINED") && !bStatus.equals(status)) return false;
            }
            if (date != null && !date.isEmpty()) {
                String bDate = b.getStartTime() != null ? b.getStartTime().toLocalDate().toString() : "";
                if (!bDate.equals(date)) return false;
            }
            if (search != null && !search.isEmpty()) {
                String s = search.toLowerCase();
                String resId = String.valueOf(b.getResourceId()).toLowerCase();
                String uId = String.valueOf(b.getUserId()).toLowerCase();
                return resId.contains(s) || uId.contains(s);
            }
            return true;
        }).toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "Booking Details Report");

            Paragraph info = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            info.setFont(FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY));
            info.setSpacingAfter(15);
            document.add(info);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{1.5f, 3.5f, 3f, 4f, 4f, 3f});

            String[] headers = {"ID", "Resource", "User ID", "Start Time", "End Time", "Status"};
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(SLIIT_NAVY);
                cell.setPadding(5);
                table.addCell(cell);
            }

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            for (Booking b : bookings) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(b.getId()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(b.getResourceId()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(b.getUserId()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(b.getStartTime() != null ? b.getStartTime().format(fmt) : "N/A", cellFont)));
                table.addCell(new PdfPCell(new Phrase(b.getEndTime() != null ? b.getEndTime().format(fmt) : "N/A", cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(b.getStatus()), cellFont)));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    public byte[] generateResourcesReport(String type, String status, String location) {
        List<Resource> resources = resourceRepository.findAll();
        
        resources = resources.stream().filter(r -> {
            if (type != null && !type.isEmpty() && !String.valueOf(r.getType()).equals(type)) return false;
            if (status != null && !status.isEmpty() && !String.valueOf(r.getStatus()).equals(status)) return false;
            if (location != null && !location.isEmpty()) {
                String loc = String.valueOf(r.getLocation()).toLowerCase();
                if (!loc.contains(location.toLowerCase())) return false;
            }
            return true;
        }).toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "Resource Inventory Report");

            Paragraph info = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            info.setFont(FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY));
            info.setSpacingAfter(15);
            document.add(info);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{4f, 3f, 2f, 4f, 3f});

            String[] headers = {"Name", "Type", "Cap.", "Location", "Status"};
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(SLIIT_NAVY);
                cell.setPadding(5);
                table.addCell(cell);
            }

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Resource r : resources) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getName()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getType()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getCapacity()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getLocation()), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getStatus()), cellFont)));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    private void addHeader(Document document, String title) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, SLIIT_NAVY);
        Paragraph p1 = new Paragraph("SLIIT SpaceSync Hub", titleFont);
        p1.setAlignment(Element.ALIGN_CENTER);
        document.add(p1);

        Font contactFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        Paragraph p2 = new Paragraph("New Kandy Road, Malabe | Phone: 0112344545 | Email: info@sliit.lk", contactFont);
        p2.setAlignment(Element.ALIGN_CENTER);
        p2.setSpacingAfter(10);
        document.add(p2);

        Font subFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, SLIIT_GOLD);
        Paragraph p3 = new Paragraph(title, subFont);
        p3.setAlignment(Element.ALIGN_CENTER);
        p3.setSpacingAfter(20);
        document.add(p3);
        
        Paragraph line = new Paragraph("______________________________________________________________________________");
        line.setSpacingAfter(15);
        document.add(line);
    }
}
