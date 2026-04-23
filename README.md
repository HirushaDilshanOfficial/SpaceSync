# SpaceSync - Smart Campus Operations Hub

## Project Overview
SpaceSync is a production-inspired web system designed for SLIIT (IT3030 - PAF Assignment 2026). The system serves as a modern Smart Campus Operations Hub, enabling efficient management of university facilities, assets, and maintenance workflows through a centralized platform.

## Core Modules and Features

### Module A - Facilities and Assets Catalogue
- Comprehensive catalogue of bookable resources including lecture halls, labs, meeting rooms, and equipment (projectors, cameras, etc.).
- Resource Metadata: Tracks type, capacity, location, and availability windows.
- Status Management: Resources are categorized by status such as ACTIVE or OUT_OF_SERVICE.
- Search and Filtering: Advanced filtering capabilities based on resource type, capacity, and location.

### Module B - Booking Management
- Reservation Workflow: Users can request resources by providing date, time range, purpose, and attendee count.
- Status Lifecycle: Bookings follow a strict workflow: PENDING -> APPROVED/REJECTED -> CANCELLED.
- Conflict Prevention: Intelligent scheduling logic to prevent overlapping bookings for the same resource.
- Administrative Control: Admin users can review, approve, or reject requests with mandatory reasoning.
- Visibility: Users can track their personal bookings, while Admins maintain a global view of all campus reservations.

### Module C - Maintenance and Incident Ticketing
- Incident Reporting: Users can create tickets for specific resources or locations with priority levels and descriptions.
- Evidence Attachments: Supports up to 3 image attachments per ticket for better diagnostic clarity.
- Ticket Workflow: Managed through stages: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED.
- Technician Assignment: Specialized technician role for task assignment, status updates, and resolution notes.
- Collaborative Comments: Integrated communication channel for users and staff on individual tickets with ownership rules.

### Module D - Notifications
- Real-time Alerts: Automated system notifications for booking updates (approval/rejection) and ticket status changes.
- Comment Alerts: Users are notified when technicians or admins post comments on their tickets.
- Web UI Integration: A dedicated notification panel within the dashboard for easy accessibility.

### Module E - Authentication and Authorization
- Secure Login: Implementation of OAuth 2.0 using Google Sign-In for secure university-wide access.
- Role-Based Access Control (RBAC): Strict access rules for USER, TECHNICIAN, and ADMIN roles.
- Endpoint Protection: Secure REST API endpoints and protected frontend routes based on user authorization.

## Special Features

- Professional PDF Reporting: Admins can export detailed booking reports and resource inventories as professionally designed PDF documents with SLIIT branding.
- QR Code Check-in System: Automated generation of unique QR codes for approved bookings, enabling administrators to verify attendance quickly using a built-in browser scanner.
- Interactive Maintenance Calendar: A visual calendar interface for administrators to track and manage all ongoing and scheduled maintenance tasks across the campus.
- Cloudinary Image Hosting: Seamless integration with Cloudinary for robust and scalable storage of incident evidence images.
- Premium SLIIT Branding: A modern and professional user interface designed specifically around SLIIT's Navy and Gold brand identity, featuring glassmorphism and smooth micro-animations.
- Real-time Notifications: Background synchronization to provide instant feedback on booking statuses and ticket updates without page refreshes.

## Technology Stack

### Backend (Java Spring Boot)
- Architecture: Layered architecture (Controller, Service, Repository, Entity).
- API Design: RESTful best practices with structured error handling and validation.
- Database: MySQL for persistent storage and auditability.
- Security: Spring Security for JWT and OAuth 2.0 handling.

### Frontend (React)
- Framework: Vite-based React application.
- UI/UX: Custom-styled components following SLIIT brand guidelines.
- State Management: React Context API for Auth and Notifications.

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js (LTS)
- MySQL Server

### Database Setup
1. Create a database named `spacesync_db`.
2. Update `backend/src/main/resources/application.yaml` with your local credentials.

### Running the Application
1. Start the Backend:
   cd backend
   ./mvnw spring-boot:run
   
2. Start the Frontend:
   cd frontend
   npm install
   npm run dev

## License
Developed for academic purposes - IT3030 PAF Assignment 2026.