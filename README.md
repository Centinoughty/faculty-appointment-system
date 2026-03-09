# Faculty Appointment Management System (FAMS)

A modern, fast, and responsive PWA (Progressive Web App) built to streamline faculty-student appointment scheduling.

## 🚀 Overview

FAMS is designed to bridge the gap between students and faculty by providing a centralized platform for scheduling, managing, and tracking appointments. Built with a focus on ease of use and modern web standards, it offers a seamless experience on both mobile and desktop.

## ✨ Key Features

- **Dashboard**: Distinct views for Students, Faculty, and Admin.
- **Appointment Scheduling**: Intuitive calendar and time-slot selection.
- **Notifications**: Real-time updates for appointment status.
- **Student/Faculty Profiles**: Manage personal details and academic info.
- **PWA Support**: Installable as an app on your device for quick access.
- **Responsive Design**: Optimized for all screen sizes using Tailwind CSS.

## 🛠️ Tech Stack

### Frontend

- **[Next.js 16 (App Router)](https://nextjs.org/)**: React framework for production.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework.
- **[Lucide React](https://lucide.dev/)**: For clean, modern iconography.
- **[Redux Toolkit](https://redux-toolkit.js.org/)**: For robust state management.
- **[Capacitor](https://capacitorjs.com/)**: To wrap web apps for native environments (Android).
- **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible UI primitives.
- **[Shadcn UI](https://ui.shadcn.com/)**: Beautifully designed components.
- **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager.

### Backend (In Progress)

- **[FastAPI](https://fastapi.tiangolo.com/)**: High-performance Python backend.
- **PostgreSQL**: (Planned) Robust relational database.

## 📂 Project Structure

- `client/`: The Next.js frontend application.
- `server/`: (Planned/In Progress) The FastAPI backend application.
- `docs/`: Project documentation and implementation plans.
- `SRS.pdf`: Software Requirements Specification document.

## ⚙️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended) or [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) (Optional, for containerized development)

### Frontend Development

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Start the development server:
    ```bash
    bun run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Development

You can also run the client using Docker:

```bash
docker-compose -f docker-compose.dev.yml up
```

## 📜 Documentation

- [Developer's Guide (Beginner)](./client/FAMS_DOCUMENTATION.md): Detailed explanation of the frontend concepts.
- [SRS Document](./SRS.pdf): Detailed requirements and system design.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

