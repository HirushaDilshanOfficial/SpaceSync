# 🚀 SpaceSync – Smart Campus Operations Hub

> IT3030 – PAF Assignment 2026 | Faculty of Computing, SLIIT

SpaceSync is a full-stack web application built with **Spring Boot** (REST API) and **React** (Client), designed to manage facility bookings, maintenance tickets, and campus operations — all in one unified platform.

---

## 👥 Team Modules

| Member | Module | Description |
|--------|--------|-------------|
| Member 1 | Module A | Facilities & Assets Catalogue |
| Member 2 | Module B | Booking Management |
| Member 3 | Module C | Maintenance & Incident Ticketing |
| **Member 4** | **Module D + E** | **Notifications + Auth & Authorization** |

---

## 🏗️ Architecture

```
SpaceSync/
├── backend/          # Spring Boot REST API (Java 17, Maven)
└── frontend/         # React 18 client app (Vite)
```

---

## 🔐 Module E – Authentication & Authorization (Member 4)

- **OAuth 2.0 Google Sign-In** via Spring Security
- **JWT-based** stateless auth (issued after OAuth2 callback)
- **Role-based access control**: `USER`, `ADMIN`, `TECHNICIAN`
- Protected API endpoints + guarded React routes

### Auth Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/me` | Authenticated | Get current user profile |
| GET | `/api/auth/roles` | ADMIN | List all roles |
| POST | `/api/auth/assign-role` | ADMIN | Assign role to a user |
| GET | `/api/users` | ADMIN | List all users |
| DELETE | `/api/users/{id}` | ADMIN | Remove a user |

---

## 🔔 Module D – Notifications (Member 4)

- Real-time-style notifications for booking approvals/rejections, ticket updates, and new comments
- Notification bell in the UI header with unread count badge
- Slide-out notification panel + dedicated notifications page

### Notification Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | USER | Get user's notifications |
| GET | `/api/notifications/unread-count` | USER | Unread count |
| PUT | `/api/notifications/{id}/read` | USER | Mark as read |
| PUT | `/api/notifications/read-all` | USER | Mark all as read |
| DELETE | `/api/notifications/{id}` | USER | Delete notification |
| POST | `/api/notifications/send` | ADMIN | Send notification to user |

---

## ⚙️ Setup & Running

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### Backend

```bash
cd backend
mvn spring-boot:run
```

> API runs at `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> UI runs at `http://localhost:5173`

---

## 🔑 Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create an OAuth 2.0 Client ID (Web Application type)
3. Add `http://localhost:8080/login/oauth2/code/google` as an authorized redirect URI
4. Copy your **Client ID** and **Client Secret**
5. Update `backend/src/main/resources/application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

---

## 🗃️ Database

The project currently runs with **H2 in-memory** database for development.
MySQL configuration will be added later:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/spacesync
spring.datasource.username=root
spring.datasource.password=yourpassword
```

---

## 🧪 Testing

```bash
cd backend
mvn test
```

---

## 📁 CI/CD

GitHub Actions workflow is configured at `.github/workflows/ci.yml` — runs on every push/PR to `main`.

---

## 📄 License

MIT © SpaceSync Team 2026 – SLIIT