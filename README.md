# Academy Annual Contract Renewal Tracker &ndash; Oxygen Sports

A modern, responsive, and professional web application designed for **Oxygen Sports** to manage annual equipment supply contracts, track renewal boundaries, monitor price revisions, assign relationship managers, and generate automated alerts before contracts expire.

## Architecture & Tech Stack

This project is built as a double-package decoupled structure orchestrated by a root control deck:

- **Frontend Application (`/frontend`)**: 
  - **Core**: React.js (Vite compiler)
  - **Styling**: Tailwind CSS v3 (custom business palette)
  - **Charts**: Recharts (status pie charts, monthly trend area graphs, RM bar charts)
  - **Icons**: Lucide React
  - **Routing**: React Router DOM (with role-restricted route locks)

- **Backend API Services (`/backend`)**:
  - **Framework**: Express.js (Node.js RESTful API)
  - **Database**: SQLite3 local database (auto-creates and seeds `database.sqlite` file)
  - **Security**: JWT Authentication (JSON Web Tokens) and BcryptJS hashing password controls.

---

## Directory Layout

```
/oxygen-sports
├── package.json         # Root manager scripts to boot services concurrently
├── README.md            # Startup documentation guide
├── backend/
│   ├── server.js        # Express application entry
│   ├── config/          # Database connections and seeding
│   ├── controllers/     # Authentication, contracts and user CRUD handlers
│   ├── middleware/      # JWT verifiers and roles access guards
│   └── routes/          # API route bindings
└── frontend/
    ├── index.html       # HTML frame loading Inter font
    ├── vite.config.js   # Vite server with API proxy rules
    └── src/
        ├── main.jsx     # React entry loader
        ├── App.jsx      # Router deck and layout wrapper
        ├── context/     # Auth state context providers
        └── pages/       # Dashboard, forms, tables, details and admin views
```

---

## Evaluation Credentials

The database automatically seeds with default users. Use any of the presets below to evaluate different roles:

| Role | Username (Email) | Password | Clearance & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@oxygensports.com` | `password123` | Full access. CRUD contracts, manage users, modify notification settings, backups. |
| **Relationship Manager** | `rm@oxygensports.com` | `password123` | Portfolio manager. Add/edit contracts, view dashboards, reports, and alert counts. |
| **Management** | `mgmt@oxygensports.com` | `password123` | Read-only auditor. Inspect all metrics dashboards, download reports, view audit logs. |

---

## Fast Startup Instructions

Follow these commands to install dependencies and boot the application:

### 1. Install Dependencies
Run this command at the root directory to install packages for orchestrators, the frontend, and backend components automatically:
```bash
npm run install:all
```

### 2. Boot Developer Servers
Start the Express server (port 5000) and the Vite React server (port 3000) concurrently using this orchestrator command:
```bash
npm run dev
```

- Access the frontend dashboard panel by browsing: **`http://localhost:3000`**
- Preset buttons are provided on the Login Portal screen for instant one-click evaluation logs.
