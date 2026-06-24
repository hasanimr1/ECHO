# ECHO

ECHO is a real-time web application built with a modern technology stack. It provides a highly interactive and visually appealing frontend accompanied by a robust and real-time backend. 

## 🚀 Live Demo

- **Frontend:** Deployed on [Vercel](https://vercel.com/)
- **Backend:** Deployed on [Render](https://render.com/)

## 🛠️ Technology Stack

ECHO is architected as a full-stack application with distinct frontend and backend solutions.

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS + Framer Motion for animations
- **3D Graphics:** React Three Fiber & Three.js 
- **Real-time Communication:** Microsoft SignalR Client
- **AI Integration:** Google GenAI
- **Typography:** @fontsource (Inter, Lora, Space Grotesk)
- **Icons:** Lucide React

### Backend (EchoApi)
- **Framework:** ASP.NET Core Web API
- **Language:** C#
- **Database:** SQLite (Entity Framework Core)
- **Real-time:** SignalR Hubs
- **Deployment:** Render (via Dockerfile)

## 📁 Project Structure

```text
├── EchoApi/               # ASP.NET Core Backend
│   ├── Controllers/       # API Controllers
│   ├── Data/              # EF Core Database Context & Models
│   ├── Hubs/              # SignalR Hubs for Real-time communication
│   ├── Migrations/        # EF Core Migrations
│   ├── Dockerfile         # Docker configuration for Render deployment
│   └── echo.db            # SQLite Database
├── src/                   # React Vite Frontend
│   ├── components/        # Reusable UI Components
│   ├── index.css          # Tailwind CSS configurations
│   ├── App.tsx            # Main Application logic
│   ├── api.ts             # API client services
│   ├── store.ts           # State management
│   └── useSignalR.ts      # SignalR hook for real-time updates
├── server.ts              # Local Express fallback server (Dev/Legacy uses)
└── vite.config.ts         # Vite Configuration
```

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Git](https://git-scm.com/)

### 1. Running the Backend locally
Navigate to the `EchoApi` directory:
```bash
cd EchoApi
```
Restore the .NET packages:
```bash
dotnet restore
```
Apply any database migrations to ensure the SQLite database is up to date:
```bash
dotnet ef database update
```
Run the backend server:
```bash
dotnet run
```
The backend API will run, generally on `http://localhost:5xxx` or `https://localhost:7xxx`.

### 2. Running the Frontend locally
Open a new terminal at the root of the project.
Install the dependencies:
```bash
npm install
```
Setup your environment variables. Ensure you have `.env.local` configured (e.g., provide your `GEMINI_API_KEY`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
Run the frontend development server:
```bash
npm run dev
```

The frontend will typically run at `http://localhost:5173`. Make sure the frontend's API calls point to your local .NET backend URL during development.

## 🚢 Deployment

### Frontend (Vercel)
The frontend is optimized and deployed on Vercel. Vercel automatically detects the Vite setup. Set your environment variables (like `VITE_API_URL` leading to your Render backend) in the Vercel project settings to ensure smooth API connectivity.

### Backend (Render)
The backend is Dockerized and deployed via Render using a Web Service.
Render builds the API according to the `Dockerfile` located in `EchoApi/`. Ensure that your Render environment is properly configured to allow CORS requests from your Vercel frontend domain. The SQLite database is configured, and for permanent storage (in Render), a Disk is mapped to securely preserve `echo.db`.

## 📄 License
This project is for educational/demonstration purposes.
