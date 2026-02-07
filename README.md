# 🏢 MeetingSpace – Corporate Meeting Room Booking System

MeetingSpace is a full-stack web application designed to help organizations manage and book meeting rooms efficiently.
Employees can view room availability and book rooms without conflicts, while administrators manage rooms, amenities, and monitor usage through a dashboard.

<p align="center">
  <p>Landing Page </p>
  <img src="https://raw.githubusercontent.com/CatsOnTree/MruImgs/main/assests/img/ms_lp.png" alt="name"/>
</p>
<p align="center">
  <p>Home Page </p>
  <img src="https://raw.githubusercontent.com/CatsOnTree/MruImgs/main/assests/img/ms_home.png" alt="name"/>
</p>
<p align="center">
  <p>Admin Page </p>
  <img src="https://raw.githubusercontent.com/CatsOnTree/MruImgs/main/assests/img/ms_admin.png" alt="name"/>
</p>

---

## 📌 Problem Statement

In many organizations, meeting rooms are booked manually or through informal communication, leading to double bookings, confusion about availability, and poor utilization of rooms.

MeetingSpace solves this problem by providing a centralized, secure, and automated room booking system.

---

## 🚀 Key Features

### 👤 User Features

- User registration with email verification
- Secure login using JWT authentication
- View meeting rooms with capacity, floor, and amenities
- Check real-time room availability
- Book meeting rooms without overlapping conflicts
- Cancel existing bookings

### 🛠️ Admin Features

- Create and manage meeting rooms
- Assign amenities (TV, WiFi, Whiteboard, etc.)
- Enable / disable rooms
- View daily booking statistics per room
- Role-based access control (ADMIN / USER)

---

## 🧱 Tech Stack

Frontend: React
Backend: Spring Boot
Database: PostgreSQL
ORM: Spring Data JPA
Security: Spring Security + JWT
Build Tool: Maven

---

## 🧭 Complete System Flow

1. User registers using email and password
2. System generates a verification token
3. User verifies email
4. User logs in and receives a JWT token
5. User views rooms and availability
6. User books a room without conflicts
7. Admin manages rooms and monitors bookings

---

## 🔐 Authentication & Security

- Passwords encrypted using BCrypt
- JWT-based stateless authentication
- Role-based access control
- Secure booking conflict prevention

---

## 🧩 Database Design & Entity Relationships

- User ↔ Role (Many-to-Many)
- User → Booking (One-to-Many)
- Booking → Room (Many-to-One)
- Room ↔ Amenity (Many-to-Many)
- User ↔ VerificationToken (One-to-One)

---

## 📊 ER Diagram

See MeetingSpace_ER_Diagram.png in the repository.

---

## 📁 Backend Project Structure

meetingspace-backend/
└── src/main/java/com/meetingspace
├── MeetingspaceApplication.java
├── config/
├── controller/
├── dto/
├── entity/
├── repository/
├── security/
└── service/

---

## 📘 API Overview

Authentication APIs:

- POST /api/v1/auth/register
- GET /api/v1/auth/verify
- POST /api/v1/auth/login

User APIs:

- GET /api/v1/rooms/{roomId}/availability
- POST /api/v1/bookings
- POST /api/v1/bookings/{bookingId}/cancel

Admin APIs:

- POST /api/v1/admin/rooms
- GET /api/v1/admin/rooms
- GET /api/v1/admin/dashboard/rooms

---

## ⚙️ How to Run

Prerequisites:

- Java 11 or 17
- PostgreSQL
- Maven

Steps:

1. Clone the repository
2. Configure application.properties
3. Run using mvn spring-boot:run

---

## 🏁 Conclusion

MeetingSpace is a secure, scalable, and user-friendly solution for managing corporate meeting rooms.
