# FleetFlow - Transport & Fleet Management System

A comprehensive Enterprise Fleet & Transport Management platform built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Key Features

- **Fleet Tracking & Vehicle Telematics**: Real-time vehicle status, odometer tracking, maintenance schedules, and fuel logs.
- **Dispatch & Route Management**: Intelligent load planning, driver assignments, and turn-by-turn route tracking.
- **Safety & Compliance**: Driver logs, document uploads & expirations, inspection workflows, and incident reporting.
- **Role-Based Access Control**: Tailored dashboards and permissions for Admins, Dispatchers, Drivers, and Maintenance personnel.
- **Analytics & Reporting**: Performance dashboards, fuel economy, turnaround metrics, and audit logs.

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Bootstrap 5** & **Bootstrap Icons**
- **Lucide React** Icons
- **Recharts** for Telematics & Analytics
- **Framer Motion** for Smooth Transitions
- **Axios** & **React Router DOM**

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **JWT** Authentication & **Bcrypt.js**
- **Multer** for Document & Media Management
- **Helmet**, **Rate Limiting**, & **Morgan** Logging

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ezhilmaran06/fleetflow_transport_management.git
   cd fleetflow_transport_management
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory (refer to `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/fleetflow
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   UPLOAD_DIR=uploads
   ```
   Optionally seed the database:
   ```bash
   npm run seed:dev
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📄 License
This project is licensed under the ISC License.
