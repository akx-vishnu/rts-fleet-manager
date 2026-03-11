# RTS Fleet Manager

A comprehensive, real-time Employee Transportation and Fleet Management System. This project provides a complete solution for managing employee rosters, route planning, fleet tracking, and trip execution. It consists of a modern web dashboard for administrators and a driver-facing interface for trip management.

## 🚀 Features

### Admin Dashboard
- **Real-time Tracking:** Live map view to track fleet vehicles using WebSockets and Leaflet/Three.js.
- **Roster Management:** Manage employee rosters, schedules, and assignments.
- **Route Planning:** Create, edit, and optimize vehicle routes.
- **Fleet Management:** Maintain records of vehicles, their status, and assignments.
- **Personnel Management:** Manage employees and drivers in the system.
- **Leave Management:** Handle employee leave requests.
- **Trips Management:** Schedule trips, monitor ongoing trips, and review historical data.
- **Analytics:** Data visualization and insights on fleet operations.
- **Audit Logs:** Comprehensive activity logging across the system for security and compliance.

### Driver Interface
- Dedicated interface for drivers to view their assigned trips, route details, and update trip status in real-time.

## 💻 Tech Stack

### Frontend (Next.js Application)
Modern, responsive UI built with Next.js 16 and React 19.
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Maps & 3D:** Leaflet (`react-leaflet`), Three.js (`@react-three/fiber`, `@react-three/drei`)
- **Animations:** Framer Motion
- **Real-time Communication:** Socket.io-client
- **Date Handling:** Date-fns
- **HTTP Client:** Axios

### Backend (NestJS API)
Scalable backend services for data processing and real-time events.
- **Framework:** NestJS 11
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Real-time:** Socket.io (NestJS Websockets)
- **Authentication & Security:** JWT, Passport, bcryptjs
- **Validation:** class-validator, class-transformer

## 📂 Project Structure

```text
rts-fleet-manager/
├── backend/                  # NestJS API application
│   ├── src/
│   │   ├── auth/             # Authentication & Authorization
│   │   ├── drizzle/          # Database Schema & Migrations
│   │   ├── fleet/            # Vehicle management module
│   │   ├── rosters/          # Roster management module
│   │   ├── routes/           # Routing module
│   │   ├── trips/            # Trip execution tracking
│   │   ├── users/            # User management
│   │   ├── events/           # Websocket event gateways
│   │   └── ...
│   └── nest-cli.json
└── frontend/                 # Next.js web application
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/       # Login/Authentication pages
    │   │   ├── (dashboard)/  # Admin Dashboard UI
    │   │   │   └── admin/    # Admin views (Tracking, Vehicles, Analytics, etc.)
    │   │   └── (driver)/     # Driver Mobile View UI
    │   └── ...
    └── next.config.ts
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL
- Redis (if used for caching/queues in NestJS)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and configure your database connection string and JWT secrets.
   ```bash
   cp .env.example .env
   ```
4. Run database migrations or seed the database:
   ```bash
   npm run seed:all
   ```
5. Start the API server:
   ```bash
   # Development mode
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add backend API URLs.
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is proprietary and confidential. Unauthorized copying of files, via any medium, is strictly prohibited.
