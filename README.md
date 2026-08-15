# WorkFlow - Production Role-Based Access Control (RBAC) Platform

[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://role-based-access-control-wfh9-seven.vercel.app)
[![Hosted on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://rolebasedaccesscontrol-dduj.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.19-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/cloud/atlas)

A full-stack, enterprise-ready **Role-Based Access Control (RBAC)** workflow and task management application built with **Next.js 16**, **Express.js**, **TypeScript**, **Redux Toolkit**, and **MongoDB Atlas**.

---

## 🌐 Live Application Links

- **Working Web Application (Frontend)**: [https://role-based-access-control-wfh9-seven.vercel.app](https://role-based-access-control-wfh9-seven.vercel.app)
- **Backend API (Health Check)**: [https://rolebasedaccesscontrol-dduj.onrender.com/health](https://rolebasedaccesscontrol-dduj.onrender.com/health)
- **GitHub Repository**: [https://github.com/AbhayTripathi8090/roleBasedAccessControl](https://github.com/AbhayTripathi8090/roleBasedAccessControl)

---

## 🔑 Default Test Credentials

For quick evaluation, pre-configured role accounts are available:

| Role | Email | Password | Access Rights & Scope |
|---|---|---|---|
| **Admin** | `admin@test.com` | `password123` | Full access across all users, projects, tasks, and system audit logs. |
| **Manager** | `manager@test.com` | `password123` | Create and manage owned projects, assign project members, create and assign tasks. |
| **Member User** | `user@test.com` | `password123` | View assigned tasks and update task progress/status (`TODO` -> `IN_PROGRESS` -> `COMPLETED`). |

*(Note: Preset login buttons are built directly into the login screen for instant one-click testing.)*

---

## 💻 Technology Stack

### Frontend (`/client`)
- **Framework**: Next.js 16 (App Router with Turbopack) & React 19
- **Language**: TypeScript
- **State Management**: Redux Toolkit & React-Redux
- **Styling**: Tailwind CSS v4 & Lucide React icons
- **Form & Validation**: React Hook Form & Zod schema validation
- **HTTP Client**: Axios with interceptors and `withCredentials: true`

### Backend (`/server`)
- **Runtime**: Node.js (v20+) & Express.js
- **Language**: TypeScript
- **Database & ORM**: MongoDB Atlas & Mongoose
- **Authentication**: JSON Web Tokens (JWT) stored in `HttpOnly`, `SameSite=None`, `Secure` cookies
- **Security**: bcryptjs password hashing, CORS credentials authorization, Cookie Parser

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js `v20.0.0` or higher
- npm `v10.0.0` or higher
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/AbhayTripathi8090/roleBasedAccessControl.git
cd roleBasedAccessControl
```

### 2. Environment Configuration

#### Backend Setup (`/server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/workflow_rbac
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

#### Frontend Setup (`/client/.env.local`)
Create a `.env.local` file inside the `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Install Dependencies & Run Locally

From the project root:
```bash
# Install root monorepo dependencies
npm install

# Run both client and server concurrently
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm install
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:3000)
cd client
npm install
npm run dev
```

### 4. Seed Database (Optional)
To populate local or remote databases with default roles and demo users:
```bash
cd server
npx tsx src/seed.ts
```

---

## 🏛️ Assumptions & Design Decisions

1. **Security-First Cookie Authentication**:
   - Authentication tokens are issued as `HttpOnly`, `SameSite=None`, `Secure` cookies. This prevents JavaScript from accessing tokens, effectively shielding the application from Cross-Site Scripting (XSS) token theft.

2. **Multi-Layered Resource Authorization**:
   - Access control is not limited to static roles. It evaluates both global role levels (`ADMIN`, `MANAGER`, `USER`) and dynamic resource ownership (e.g., project ownership, project member list, task assignee).

3. **Immutable Audit Logging**:
   - Every state-altering action (`CREATE_USER`, `UPDATE_ROLE`, `CREATE_PROJECT`, `UPDATE_TASK_STATUS`, `DELETE_TASK`, etc.) triggers an audit log record preserving the acting user, target resource, action type, timestamp, and field changes.

4. **Monorepo Architecture**:
   - The repository is organized into distinct `client/` and `server/` modules, ensuring clean separation of concerns while sharing single-command development scripts.

---

## 📄 License
This project is open-source under the MIT License.
