# 🚀 TaskFlow – Smart Task & Team Management System

A full-stack **MEAN** (MongoDB, Express.js, Angular, Node.js) web application for managing projects and tasks with a modern, responsive UI, JWT authentication, and real-time analytics.

---

## 📁 Project Structure

```
TaskFlow/
├── backend/                    # Node.js + Express backend
│   ├── config/                 # DB & app configuration
│   ├── controllers/            # Business logic handlers
│   ├── middleware/             # Auth, validation, error handlers
│   ├── models/                 # Mongoose schemas (MongoDB)
│   ├── routes/                 # Express route definitions
│   ├── utils/                  # Helper utilities
│   ├── validators/             # Request input validators
│   ├── uploads/                # Avatar image storage
│   ├── app.js                  # Express app setup
│   ├── server.js               # Entry point
│   └── .env                    # Environment variables
│
├── frontend/                   # Angular 21 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, interceptors, models
│   │   │   ├── features/       # Page components (dashboard, projects, tasks, profile)
│   │   │   ├── layout/         # App shell (sidebar + navbar)
│   │   │   └── shared/         # Reusable components, pipes
│   │   ├── styles.css          # Global theme & design tokens
│   │   └── index.html
│   └── angular.json
│
└── README.md
```

---

## 🛠️ Technology Stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| Frontend    | Angular 21, TypeScript, Angular Material |
| Styling     | Tailwind CSS v4, Custom CSS Variables    |
| Charts      | Chart.js 4.x                             |
| Backend     | Node.js 24, Express 5                    |
| Database    | MongoDB (Atlas / Local), Mongoose 9      |
| Auth        | JWT (jsonwebtoken), bcrypt               |
| Security    | Helmet, CORS, Rate Limiting              |
| Validation  | express-validator                        |
| File Upload | Multer                                   |

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+ (v24 recommended)
- MongoDB Atlas account OR local MongoDB
- Angular CLI: `npm install -g @angular/cli`

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd TaskFlow
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set your MongoDB URI and JWT secret:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Install & Run Backend
```bash
cd backend
npm install
npm run dev      # Development with hot-reload (nodemon)
# OR
npm start        # Production
```
Backend runs at: **http://localhost:5000**

### 4. Install & Run Frontend
```bash
cd frontend
npm install
npm start        # ng serve
```
Frontend runs at: **http://localhost:4200**

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint                  | Description          | Auth |
|--------|---------------------------|----------------------|------|
| POST   | `/api/auth/register`      | Register new user    | ❌   |
| POST   | `/api/auth/login`         | Login user           | ❌   |
| GET    | `/api/auth/profile`       | Get current user     | ✅   |
| PUT    | `/api/auth/profile`       | Update profile       | ✅   |
| PUT    | `/api/auth/change-password` | Change password    | ✅   |

### Projects (`/api/projects`)
| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| GET    | `/api/projects`       | List all projects        | ✅   |
| POST   | `/api/projects`       | Create project           | ✅   |
| GET    | `/api/projects/:id`   | Get project by ID        | ✅   |
| PUT    | `/api/projects/:id`   | Update project           | ✅   |
| DELETE | `/api/projects/:id`   | Delete project + tasks   | ✅   |

**Query params for GET /api/projects:** `?search=&page=&limit=&status=`

### Tasks (`/api/tasks`)
| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| GET    | `/api/tasks`        | List tasks        | ✅   |
| POST   | `/api/tasks`        | Create task       | ✅   |
| GET    | `/api/tasks/:id`    | Get task by ID    | ✅   |
| PUT    | `/api/tasks/:id`    | Update task       | ✅   |
| DELETE | `/api/tasks/:id`    | Delete task       | ✅   |

**Query params for GET /api/tasks:** `?projectId=&status=&priority=&search=&sortBy=&sortOrder=&page=&limit=`

### Dashboard & Analytics
| Method | Endpoint          | Description             | Auth |
|--------|-------------------|-------------------------|------|
| GET    | `/api/dashboard`  | Dashboard statistics    | ✅   |
| GET    | `/api/analytics`  | Chart data & analytics  | ✅   |

---

## 🔐 Authentication Flow

```
User Registers → Password Hashed (bcrypt) → Stored in MongoDB
       ↓
User Logs In → JWT Generated → Sent to Frontend
       ↓
Angular stores JWT in localStorage
       ↓
HTTP Interceptor adds "Authorization: Bearer <token>" to every request
       ↓
Backend Auth Middleware verifies token
       ↓
Protected route accessible ✅
       ↓
Token expires → Auto logout + redirect to login
```

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$12$hashed...",
  "avatar": "uploads/avatar-123.jpg",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Projects Collection
```json
{
  "_id": "ObjectId",
  "title": "E-Commerce Website",
  "description": "Build a full-stack e-commerce platform",
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Tasks Collection
```json
{
  "_id": "ObjectId",
  "title": "Design homepage UI",
  "description": "Create wireframes and mockups",
  "priority": "high",
  "deadline": "2024-02-15",
  "status": "in-progress",
  "projectId": "ObjectId (ref: Project)",
  "assignedTo": "ObjectId (ref: User)",
  "createdBy": "ObjectId (ref: User)",
  "labels": ["frontend", "design"],
  "notes": "Use Figma for wireframes",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

---

## 🔒 Security Features

| Feature           | Implementation                              |
|-------------------|---------------------------------------------|
| Password Hashing  | bcrypt with 12 salt rounds                  |
| JWT Auth          | Signed tokens with expiry                   |
| Route Protection  | Auth middleware + Angular route guards      |
| Rate Limiting     | 100 requests per 15 minutes per IP          |
| HTTP Headers      | Helmet.js security headers                  |
| CORS              | Configured for localhost:4200               |
| Input Validation  | express-validator on all routes             |
| NoSQL Injection   | Mongoose schema validation                  |
| XSS Protection    | Helmet Content-Security-Policy              |
| Env Variables     | dotenv (never commit .env)                  |

---

## 🎨 Frontend Features

| Feature             | Implementation                              |
|---------------------|---------------------------------------------|
| Routing             | Angular Router with lazy loading            |
| Auth Guard          | Redirects unauthenticated users             |
| No-Auth Guard       | Redirects logged-in users from auth pages   |
| HTTP Interceptor    | Auto-attaches JWT to all API requests       |
| Loading Spinner     | Global overlay during API calls             |
| Toast Notifications | Angular Material Snackbar                   |
| Dark Mode           | CSS variables + localStorage persistence    |
| Charts              | Chart.js (Pie, Bar, Line, Doughnut)         |
| Kanban Board        | Angular CDK DragDrop                        |
| Reactive Forms      | With full validation and error messages     |
| Responsive Layout   | CSS Grid + Flexbox                          |

---

## 🧪 Testing the API with Postman

1. Import `POSTMAN_COLLECTION.json` into Postman
2. Set environment variable `baseUrl = http://localhost:5000`
3. Run **Register** → copy `token` from response
4. Set `token` as environment variable
5. All other requests will use it automatically

---

## 📦 Sample Data

### Register a test user:
```json
POST /api/auth/register
{
  "name": "Alice Smith",
  "email": "alice@test.com",
  "password": "Test@1234",
  "confirmPassword": "Test@1234"
}
```

### Create a project:
```json
POST /api/projects
Authorization: Bearer <token>
{
  "title": "Website Redesign",
  "description": "Complete overhaul of company website",
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

### Create a task:
```json
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Design new homepage",
  "description": "Create mockups in Figma",
  "priority": "high",
  "deadline": "2024-02-15",
  "projectId": "<project-id-here>",
  "labels": ["design", "frontend"]
}
```

---

## 🚀 Production Deployment

### Backend (Render / Railway / Heroku)
1. Set environment variables in hosting platform
2. Change `MONGO_URI` to your Atlas connection string
3. Change `NODE_ENV=production`
4. Deploy from GitHub

### Frontend (Netlify / Vercel)
1. Build: `ng build --configuration production`
2. Upload `dist/frontend/browser/` folder
3. Set redirect: All routes → `/index.html` (for SPA routing)

---

## 📖 Key Files Explained (For Viva)

| File | Purpose |
|------|---------|
| `backend/server.js` | Entry point — connects to MongoDB, starts Express server |
| `backend/app.js` | Configures Express: middleware, routes, error handlers |
| `backend/middleware/auth.js` | Verifies JWT on protected routes |
| `backend/models/User.js` | Mongoose schema with password hashing hook |
| `backend/controllers/authController.js` | Register/Login business logic |
| `frontend/src/app/app.config.ts` | Angular bootstrap config (providers) |
| `frontend/src/app/app.routes.ts` | All application routes with lazy loading |
| `frontend/src/app/core/interceptors/auth.interceptor.ts` | Auto-adds JWT to HTTP requests |
| `frontend/src/app/core/guards/auth.guard.ts` | Protects routes from unauthenticated access |
| `frontend/src/app/features/dashboard/dashboard.component.ts` | Main dashboard with stats + charts |

---

## 👨‍💻 Author

**TaskFlow** — Built as a college final-year MEAN stack project.

---

## 📄 License

MIT License — free to use for educational purposes.
