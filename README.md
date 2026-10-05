# OpenBook — E-Learning Course Progress Tracker

OpenBook is a course platform for learners and instructors. Learners can enroll in courses, work through lessons, and track completion. Instructors can create and manage courses and review enrollment and completion rates.

The project includes a React frontend and an Express API backed by MongoDB. The API owns course, enrollment, and progress data; the frontend reads and updates that data through HTTP requests.

## Features

- Register and sign in as a learner or instructor.
- Browse, search, and filter the course catalog.
- Enroll in courses and mark lessons complete.
- View personal progress and course completion status.
- Create and edit courses and lessons as an instructor.
- View course completion analytics as the course owner.
- Use responsive layouts, loading and error states, and role-protected pages.

## Technology

- **Frontend:** React, Vite, React Router, Axios, and lucide-react
- **Backend:** Node.js, Express, and Mongoose
- **Database:** MongoDB
- **Authentication:** JWT bearer tokens with passwords hashed using bcryptjs

## Project layout

```text
backend/       Express API, database models, routes, and seed script
frontend/      React application
postman/       API request collection and local environment files
README.md      Project and setup documentation
```

## Run locally

### Requirements

- Node.js 18 or later and npm
- A MongoDB database, either local or hosted

### 1. Configure and start the API

From the project directory:

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set the values for your machine. The Vite proxy in this project targets port `5001`, so use that port for local development:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
```

For a local MongoDB instance, set `MONGO_URI` to its connection string instead. Keep `.env` private and do not commit real database credentials or JWT secrets.

Start the API:

```bash
npm run dev
```

The API should be available at `http://localhost:5001`. Check `http://localhost:5001/api/health` to confirm it is responding.

### 2. Add sample course data (optional)

With the API environment configured, open another terminal:

```bash
cd backend
npm run seed
```

The seed script creates or updates seven sample courses with 40 lessons and instructor accounts. Run it against a development database: it writes to MongoDB and uses the demo account configuration in `backend/seed.js`. The login page’s quick-demo buttons rely on separate demo users that this seed script does not create. On a fresh database, use regular account registration and sign-in unless those demo accounts have been provisioned separately.

### 3. Configure and start the frontend

In another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` with the local API URL:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Then start Vite:

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. Create an account from the registration page if you do not already have a user in the database. The frontend has separate learner and instructor flows.

## API overview

All API responses use a `{ "message": "…", "data": … }` envelope. Except for health, registration, and login, routes require a bearer token from the login response.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API availability |
| `POST` | `/api/auth/register` | Create a learner or instructor account |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |
| `GET` | `/api/courses` | List courses |
| `POST` | `/api/courses` | Create a course (instructor) |
| `GET` | `/api/courses/:id` | Read course details and lessons |
| `PUT` / `DELETE` | `/api/courses/:id` | Update or delete an owned course |
| `POST` | `/api/courses/:id/enroll` | Enroll a learner in a course |
| `GET` | `/api/courses/:courseId/lessons` | List a course’s lessons |
| `POST` | `/api/courses/:courseId/lessons` | Add a lesson to an owned course |
| `PUT` / `DELETE` | `/api/courses/:courseId/lessons/:id` | Update or delete an owned lesson |
| `POST` | `/api/lessons/:id/complete` | Mark a lesson complete |
| `GET` | `/api/courses/:id/progress` | Read the signed-in learner’s course progress |
| `GET` | `/api/courses/:id/completion-rate` | Read aggregate completion data (course owner) |

The backend enforces roles, course ownership, and learner enrollment for progress operations. See `backend/routes/` and `backend/middleware/` for the route and authorization details.

## Frontend pages

- `/` — landing page
- `/login` and `/register` — authentication
- `/dashboard` — role-specific overview
- `/courses` — course catalog or instructor course list
- `/courses/:id` — course curriculum and lesson reader
- `/courses/new` — create a course (instructor)
- `/courses/:id/edit` — manage lessons (course owner)
- `/learning` — learner progress
- `/analytics` — instructor analytics

Protected pages redirect unauthenticated users to sign in. Instructor and learner routes are restricted by role.

## Build and API request collection

Create a production frontend build with:

```bash
cd frontend
npm run build
```

The API request definitions are in `postman/collections/`. Configure a local API base URL and test accounts in your API client before running requests. Local environment exports may contain account details or tokens and should remain private.

## Deployment notes

The intended deployment setup is a Node service on Render, MongoDB Atlas for the database, and the Vite frontend on Vercel. For deployment:

1. Set `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN` in the backend host’s environment settings. The service must bind to the port supplied by its environment.
2. Set the frontend build root to `frontend/` and provide `VITE_API_BASE_URL` as the deployed API URL ending in `/api`.
3. Check the backend CORS policy for the deployed frontend origin, and configure the frontend host to serve the React app for application routes. The current API uses Express CORS middleware with its default settings.

Set deployment values in the hosting dashboards; do not put production secrets in this repository or in frontend environment variables.

## Security notes

- `.env` files and local API client environment exports are excluded by `.gitignore`.
- `backend/.env.example` is a template; replace its placeholder values locally.
- The seed script and login page contain demo-account setup for development. Use demo accounts only, and change their credentials before exposing a seeded database publicly.
- Do not place database credentials, signing secrets, or reusable access tokens in source files, README examples, or frontend configuration. Values prefixed with `VITE_` are included in the browser build and are public.
