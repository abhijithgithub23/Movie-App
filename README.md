# CINEVIA 🎬

A modern, responsive full-stack movie application designed for discovering, tracking, and exploring films. Built with a robust React frontend and a high-performance Node.js/PostgreSQL backend, CINEVIA offers seamless user authentication, internationalization, and a dynamic UI.

##  Tech Stack

### Frontend (Client)
*   **Framework:** React 19 + Vite (TypeScript)
*   **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
*   **Routing:** React Router v7 (`react-router-dom`)
*   **Authentication:** Auth0 (`@auth0/auth0-react`)
*   **Styling:** Tailwind CSS with PostCSS & Autoprefixer
*   **Icons & UI:** Lucide React, React Hot Toast
*   **Internationalization (i18n):** `i18next`, `react-i18next`, Browser Language Detector
*   **Network:** Axios

### Backend (Server)
*   **Runtime/Framework:** Node.js, Express.js (TypeScript)
*   **Database:** PostgreSQL (`pg`)
*   **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
*   **Authentication & Security:** JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), Helmet, CORS
*   **Data Validation:** Zod
*   **Media Storage:** Cloudinary, Multer (for file uploads)
*   **Middleware:** Morgan (Logging), Express Rate Limit, Cookie Parser

---

##  Features

*   **Secure Authentication:** Integrated Auth0 on the frontend with custom JWT/Bcrypt logic on the backend.
*   **Multi-language Support:** Built-in internationalization utilizing `i18next` for seamless language switching.
*   **Optimized State:** Centralized state management utilizing Redux Toolkit.
*   **Database Seeding:** Custom TypeScript scripting (`seedMedia.ts`) to easily populate the PostgreSQL database.
*   **Cloud Media Management:** Direct integration with Cloudinary for handling image/poster uploads.
*   **API Security:** Rate limiting and Helmet integration to protect endpoints against common vulnerabilities.

---
