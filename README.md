# Employee Attendance System - MongoDB Edition

This project now uses **MongoDB Atlas + Mongoose** (MySQL/Sequelize removed).

## Stack

### Frontend
- React (Vite)
- Redux Toolkit
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- FullCalendar

### Backend
- Node.js + Express.js
- MongoDB Atlas
- Mongoose
- JWT Auth
- bcrypt
- express-validator
- json2csv
- node-cron

## Folder Structure

```text
Tap Academy 2.O/
  backend/
    src/
      config/
      constants/
      controllers/
      database/seeders/
      jobs/
      middlewares/
      models/
      repositories/
      routes/
      services/
      utils/
      validators/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      app/
      components/
      features/
      hooks/
      pages/
      services/
      utils/
      App.jsx
      main.jsx
      index.css
    .env.example
    package.json
  Screenshots/
    Employe/
    Manager/
    Mango DB/
  README.md
```

## Backend Environment

Copy `backend/.env.example` to `backend/.env` and set values:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/attendance_system?retryWrites=true&w=majority&appName=employee-attendance
MONGODB_DB_NAME=attendance_system
JWT_SECRET=super_secret_key_change_me
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
APP_TIMEZONE=UTC
SEED_FAKE_ATTENDANCE=false
```

## Frontend Environment

Copy `frontend/.env.example` to `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Run Locally

### 1. Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Seed Demo Accounts (Optional)
```bash
cd backend
npm run seed
```

By default, this creates demo users only.  
To also create fake demo attendance rows, set `SEED_FAKE_ATTENDANCE=true` before running the seed command.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

### Remove Demo Data (Keep Original Users/Data Only)
```bash
cd backend
npm run cleanup:demo
```

## Demo Users

- Manager: `manager@tapacademy.com` / `Manager@123`
- Employee: `anita@tapacademy.com` / `Employee@123`

## APIs

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboard
- `GET /api/dashboard/employee`
- `GET /api/dashboard/manager`

### Employee Attendance
- `POST /api/attendance/checkin`
- `POST /api/attendance/checkout`
- `GET /api/attendance/my-history`
- `GET /api/attendance/my-summary`
- `GET /api/attendance/today`

### Manager Attendance
- `GET /api/attendance/all`
- `GET /api/attendance/employee/:id`
- `GET /api/attendance/summary`
- `GET /api/attendance/export` (`?format=xlsx` for Excel, `?format=csv` for CSV)
- `GET /api/attendance/today-status`
- `GET /api/attendance/employees`
- `GET /api/attendance/departments`

## Pages

### Employee
- Login / Register
- Dashboard
- Attendance History (Calendar + Table)
- Profile

### Manager
- Dashboard
- Team Calendar
- Reports

## Screenshots

Screenshots are stored in the root `Screenshots/` folder:

- `Screenshots/Employe/Employee Attendance System Registration Page.png`
- `Screenshots/Employe/Employee Attendance System Dash Board.png`
- `Screenshots/Employe/Employee Attendance System Attendence.png`
- `Screenshots/Employe/Employee Attendance System Profile.png`
- `Screenshots/Manager/Employee Attendance System Attendence Dash Board -1.png`
- `Screenshots/Manager/Employee Attendance System AttendenceTeam Calender.png`
- `Screenshots/Manager/Employee Attendance System Attendence Report.png`
- `Screenshots/Mango DB/Mongo db-overview.png`

## Deployment

### Backend (Render/Railway/Fly)
1. Deploy `backend/` as a Node.js service.
2. Set environment variables from `backend/.env.example`.
3. Set `NODE_ENV=production`.
4. Use start command: `npm run start`.
5. Ensure MongoDB Atlas network access allows your hosting provider.

### Frontend (Vercel/Netlify)
1. Deploy `frontend/` as a Vite app.
2. Set `VITE_API_URL=https://<your-backend-domain>/api`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.

### CORS
Set `FRONTEND_URL` in backend environment to your deployed frontend URL.

## Business Rules

- One check-in per user per day
- Late if check-in after 9:30 AM
- Half-day if total hours < 4
- Hours calculated automatically at checkout
- Cron auto-marks absent daily at 23:59

## Notes

- Numeric `id` fields are preserved in MongoDB for backward compatibility with the frontend/API.
- Data access remains layered: Controllers -> Services -> Repositories.
