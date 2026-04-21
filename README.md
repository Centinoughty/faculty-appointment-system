# Faculty Appointment Management System

A full-stack web application that lets students book appointments with faculty members, and gives faculty full control over their availability and schedule. Admins manage users, departments, and bulk data imports from a dedicated dashboard.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
   - [Docker (recommended)](#docker-recommended)
   - [Manual Setup](#manual-setup)
4. [Environment Variables](#environment-variables)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Authors](#authors)
8. [License](#license)

---

## Project Structure

```
faculty-appointment-system/
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
├── .env.example                # Root-level env template
│
├── server/                     # FastAPI backend (Python)
│   ├── routers/                # Route handlers
│   │   ├── login.py            # Auth endpoints
│   │   ├── faculty.py          # Faculty endpoints
│   │   ├── appointment.py      # Appointment booking
│   │   └── admin.py            # Admin dashboard endpoints
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── security/               # JWT + OAuth2 cookie logic
│   ├── seed/                   # Admin seed script
│   ├── main.py
│   ├── database.py
│   └── requirements.txt
│
└── admin/                      # Next.js admin dashboard (TypeScript)
    ├── src/
    │   ├── app/                # Next.js App Router pages
    │   ├── components/         # UI components
    │   ├── store/              # Redux Toolkit store
    │   └── api/                # Axios API client
    └── package.json
```

---

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Backend          | FastAPI (Python 3.11), SQLAlchemy, PostgreSQL  |
| Admin frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Auth             | JWT (HttpOnly cookies) + Google OAuth          |
| ORM              | SQLAlchemy with Alembic-compatible models      |
| Containerisation | Docker, Docker Compose                         |

---

## Installation

### Docker (recommended)

This is the fastest way to get everything running.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

**1. Clone the repository**

```bash
git clone https://github.com/Centinoughty/faculty-appointment-system.git
cd faculty-appointment-system
```

**2. Set up environment files**

Copy the example files and fill in your values (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env
cp server/.env.example server/.env
cp admin/.env.example admin/.env
```

**3. Start in development mode**

```bash
docker compose up -d --build
```

**3a. Start in production mode**

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Once running:

- Admin dashboard → `http://localhost:8000`
- API server → `http://localhost:5000`
- Interactive API docs → `http://localhost:5000/docs`

**4. Accessing the Logs**

```bash
docker compose logs -f          # logs of all the containers together

docker compose logs -f server   # logs for server
docker compose logs -f admin    # logs for admin
docker compose logs -f posgtres # logs for postgres
```

**5. Stopping the stack**

```bash
docker compose down             # stop containers
docker compose down -v          # stop and delete the database volume
```

---

### Manual Setup

Use this if you prefer to run services directly on your machine.

**Prerequisites:** Python 3.11+, Node.js 20+, PostgreSQL 16+

#### Backend

```bash
cd server

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

#### Admin Dashboard

```bash
cd admin

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set NEXT_PUBLIC_API_URL=http://localhost:5000

# Install dependencies and start
npm install
npm run dev
```

The admin dashboard will be available at `http://localhost:3000`.

---

## Environment Variables

### `server/.env`

| Variable              | Description                                                   | Example                                          |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection string (Docker service name as host)    | `postgresql://fams:password@postgres:5432/fams`  |
| `DATABASE_URL_DIRECT` | Direct connection string (for local access outside Docker)    | `postgresql://fams:password@localhost:5432/fams` |
| `ACCESS_SECRET`       | Secret key for signing access JWTs — use a long random string | `change-me-to-a-random-secret`                   |
| `REFRESH_SECRET`      | Secret key for signing refresh JWTs                           | `another-random-secret`                          |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID from Google Cloud Console              | `123456.apps.googleusercontent.com`              |
| `COOKIE_SECURE`       | Set to `true` in production (requires HTTPS)                  | `false`                                          |
| `COOKIE_SAMESITE`     | `lax` for development, `none` for cross-origin production     | `lax`                                            |

### Root `.env` (read by Docker Compose for the postgres service)

| Variable      | Description              |
| ------------- | ------------------------ |
| `DB_NAME`     | PostgreSQL database name |
| `DB_USER`     | PostgreSQL username      |
| `DB_PASSWORD` | PostgreSQL password      |

### `admin/.env`

| Variable              | Description                    | Example                 |
| --------------------- | ------------------------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI server | `http://localhost:5000` |

> **Security note:** Never commit `.env` files to version control. The `.gitignore` already excludes them.

---

## Usage

### Seeding the first admin account

Before logging in for the first time, create an admin user by running the seed script:

```bash
# With Docker
docker exec -it fams-server python seed/admin.py

# Without Docker (with venv active)
cd server && python seed/admin.py
```

### Roles

| Role        | Access                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| **Admin**   | Full dashboard — manage departments, faculty, students, view all appointments |
| **Faculty** | Manage own schedule, approve/decline/cancel appointments, block slots         |
| **Student** | Browse faculty availability, book appointments, view own appointment history  |

### Bulk imports (Admin)

Admins can upload CSV files to create multiple users at once:

- **Faculty CSV columns:** `name`, `email`, `department_id`, `designation`, `office`
- **Student CSV columns:** `name`, `email`, `phone`, `roll_number`, `programme`, `year`
- **Timetable slots CSV columns:** `faculty_id`, `day` (0–6, Monday–Sunday), `start_time`, `end_time`

Duplicate emails are silently skipped. Generated passwords for new faculty are returned in the API response — copy them before closing.

---

## API Reference

Full endpoint documentation is in **[API.md](./API.md)** (available soon).

Interactive Swagger docs are also available at `http://localhost:5000/docs` when the server is running.

**Quick summary of routes:**

| Area              | Prefix                                     | Description                           |
| ----------------- | ------------------------------------------ | ------------------------------------- |
| Auth              | `/api/auth/*`, `/api/login`, `/api/logout` | Login, Google OAuth, session          |
| Faculty (public)  | `/api/faculty/*`                           | Browse faculty, check availability    |
| Appointments      | `/api/appointment`                         | Book and view appointments (students) |
| Faculty (private) | `/api/faculty/appointments/*`              | Manage own appointments (faculty)     |
| Admin             | `/api/admin/*`                             | Full CRUD for users and departments   |

---

## Authors

This project was built and is maintained by:

- **Nadeem M Siyam** - [Github](https://github.com/Centinoughty)
- **Sanin Mirza** - [Github](https://github.com/saninkaz)
- **Thomas James** - [Github](https://github.com/thomasjames433)
- **Aswin C** - [Github](https://github.com/aswin-c39)
- **Arun Krishna** - [Github](https://github.com/tsundere-senpai)

