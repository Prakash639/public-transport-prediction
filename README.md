# Smart Public Transport System

A comprehensive full-stack solution for managing and tracking public transportation in real-time. This system features role-based access for Admins, Drivers, and Passengers, offering live vehicle tracking, smart routing, and efficient issue management.

## 🚀 Features

### For Passengers
- **Real-Time Tracking:** View live locations of buses on an interactive map.
- **Smart Routing:** High-accuracy, road-following OSRM routing with visual path display.
- **Advanced Search:** Clean, user-friendly search UI with route-selection dropdowns to find buses easily.

### For Drivers
- **Live Location Dashboard:** Automatically captures and updates real-time GPS location when starting a trip.
- **Trip Management:** Manage active trips and continuously broadcast location to the backend.

### For Admins
- **Comprehensive Dashboard:** Overview of buses, routes, drivers, and passengers.
- **Issue Management:** Detailed issue tracking with descriptive bus route and bus numbers.
- **System Configuration:** Manage and maintain transport infrastructure easily.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React + Vite
- **Mapping:** `maplibre-gl`, `react-map-gl`
- **Routing:** React Router (`react-router-dom`)
- **Real-time Communication:** Socket.io Client
- **Styling:** Vanilla CSS / Modern UI with Glassmorphism

### Backend
- **Server:** Node.js + Express
- **Real-time Communication:** Socket.io
- **Database:** MySQL / SQLite
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`
- **Additional:** CORS, Dotenv

## 📂 Project Structure

```
publicTranspot/
├── backend/          # Node.js Express server + Socket.io
│   ├── index.js      # Main entry point 
│   ├── server.js     # Server configuration
│   └── package.json  # Backend dependencies
├── frontend/         # Vite + React frontend application
│   ├── src/          # React source code (components, pages)
│   └── package.json  # Frontend dependencies
├── db-schema.json    # Database schema definition
└── migrate.js        # Script for database migrations
```

## 📋 Database Schema
The database core models include:
- `Auth`, `Admin`, `Driver`, `Passenger`
- `Bus`, `Route`, `Trip`, `Issue`

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- NPM or Yarn
- MySQL or SQLite (configured in `.env`)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Create a `.env` file in the `backend` directory with your database and JWT secret configurations.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on your local development server (usually `http://localhost:5173`).

## 🗺️ Real-Time Map & Routing
The application integrates **OSRM** (Open Source Routing Machine) to trace accurate roads combined with live GPS data sent by drivers via Socket.io. This feeds directly into a MapLibre-powered interactive web map.

## 📝 Scripts
There are several utility scripts located in the root for data management:
- `node check-db.js`: Verify database connection and tables.
- `node migrate.js`: Run database migrations.
- `node fix-data.js` & `check-data.js`: Data formatting and sanity checks.
