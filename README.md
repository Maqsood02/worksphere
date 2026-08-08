# WorkSphere - Premium Freelancing Platform & Management System

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel)](https://vercel.com)

Welcome to WorkSphere! This repository contains a full-stack web application featuring a Java Spring Boot backend (with MongoDB and REST APIs) and a React (Vite) frontend for freelancing management, project request tracking, interactive user/client/admin dashboards, and AI Co-Pilot features.

---

## ⚡ Tech Stack & Architecture

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Chart.js.
- **Backend Core**: Java 17/21+, Spring Boot 3.3.x, Spring Web, Spring Security.
- **Database**: MongoDB (Spring Data MongoDB repositories).
- **Security**: Role-based access control (CLIENT, ADMIN, INTERN), password hashing, JWT/Session security.

---

## 📂 Project Structure

```text
├── README.md                      # Project documentation
├── .gitignore                     # Git ignore file for Java/Node build artifacts
├── run-backend.ps1                # PowerShell helper to start Spring Boot backend
├── run-frontend.ps1               # PowerShell helper to start Vite frontend
├── backend/                       # Spring Boot Java application
│   ├── pom.xml                    # Maven dependencies
│   └── src/                       # Java Controllers, Models, Services, Repositories
└── frontend/                      # React Vite frontend application
    ├── package.json               # Node packages
    └── src/                       # React components, context, pages, services
```

---

## 🛠️ Setup & Running Instructions

### 1. Prerequisite: Start MongoDB
Ensure MongoDB is running locally on your machine at the default port:
`mongodb://localhost:27017/`

If you are using a cloud MongoDB Atlas instance instead, open `backend/src/main/resources/application.properties` and update the connection URI:
`spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster.mongodb.net/freelancedb`

### 2. Run the Application

#### Backend (Spring Boot)
Open a PowerShell window and run:
```powershell
.\run-backend.ps1
```

#### Frontend (React + Vite)
In a separate terminal, navigate to the frontend or run:
```powershell
.\run-frontend.ps1
```

---

## 🔑 Default Testing Profiles (Auto-Seeded)

The application automatically seeds testing accounts in MongoDB on first startup:

- **Client Profile**: Username `client` / Password `clientpassword`
- **Admin Profile**: Username `admin` / Password `adminpassword`
