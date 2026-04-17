# Faculty Appointment System (FAMS)

A modern, full-stack application for managing faculty appointments at NITC.

## 🚀 Quick Start (Local Development)

The easiest way to run the project is using Docker Compose.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker + Docker Compose (Linux).
- A [Google Cloud Console](https://console.cloud.google.com/) project for Google Login.
- A [SendGrid Account ](https://app.sendgrid.com/) for sending email notifications
- A [Firebase Project] for push notifications 

### 2. Setup Configuration
1. Clone the repository.
2. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your:
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
   - `ACCESS_SECRET` and `REFRESH_SECRET` (Generate random hex strings).

### 3. Configure PWA (Optional)
If you need background notifications to work, run the configuration script to sync your Firebase keys:
```bash
python configure_pwa.py
```

### 4. Run the App
Navigate to the root directory and run:
```bash
docker compose up --build
```

The services will be available at:
- **Client (Student/Faculty)**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:8000](http://localhost:8000)
- **API (Backend)**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Redux Toolkit.
- **Backend**: FastAPI (Python), SQLAlchemy.
- **Database**: PostgreSQL.
- **Auth**: Google OAuth 2.0 & JWT.
- **Real-time**: WebSockets & Firebase Cloud Messaging (FCM).

---

## 📦 Deployment (Production)

To deploy to a production server (e.g., behind Nginx/Tailscale), use the specialized production compose file:

```bash
docker compose -f docker-compose.prod.yml up -d
```

*Note: Update the `ALLOWED_ORIGINS` and `NEXT_PUBLIC_API_URL` in your production `.env` to match your domain.*
