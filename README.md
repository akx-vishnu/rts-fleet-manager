# RTS Fleet Manager

A comprehensive Transport Operations & Fleet Management System built with NestJS and Next.js.

## 🚀 Overview

RTS Fleet Manager is designed to streamline logistics and transport operations. It provides real-time tracking, automated route planning, and robust scheduling features for drivers and employees.

## 🛠️ Tech Stack

- **Backend:** [NestJS](https://nestjs.com/) (Node.js framework)
- **Frontend:** [Next.js](https://nextjs.org/) (React framework)
- **Database:** PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Real-time:** [Socket.IO](https://socket.io/) for live tracking and boarding updates
- **Maps:** [Leaflet](https://leafletjs.com/) for tracking visualization

## ✨ Recent Enhancements

- **Live Boarding Tracking**: Real-time visibility into employee boarding status (Picked, Missed, Pending) on the Admin Dashboard.
- **Account-less Employees**: Streamlined employee management where employees no longer require user accounts for registration.
- **Intelligent Auth Redirects**: Automatically directs logged-in users from the landing pages to their respective dashboards.
- **Fleet Dashboard**: Comprehensive overview of fleet stats, active trips, and driver availability.

## 📂 Project Structure

```text
rts-fleet-manager/
├── backend/          # NestJS server application
├── frontend/         # Next.js client application
└── .gitignore        # Root-level git ignore rules
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rts-fleet-manager
   ```

2. Set up the Backend:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run start:dev
   ```

3. Set up the Frontend:
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file based on .env.example
   npm run dev
   ```

## 📜 License

UNLICENSED
