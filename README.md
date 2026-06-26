# Student Productivity Hub

Student Productivity Hub is a full-stack web application for managing academic tasks, assignments, study planning, habits, notes, calendar events, Pomodoro focus sessions, and productivity analytics.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Chart.js, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT email/password login and registration
- Storage-ready: Cloudinary configuration placeholder
- Deployment-ready: Vercel frontend and Render backend structure

## Project Structure

```text
frontend/   React application
backend/    Express API and Mongoose models
```

## Beginner Setup

### 1. Install Node.js

Install the LTS version of Node.js from `https://nodejs.org`.

After installation, open PowerShell and check:

```powershell
node --version
npm.cmd --version
```

Use `npm.cmd` on Windows if PowerShell blocks the `npm` command.

### 2. Open the Project Folder

```powershell
cd "E:\github\Student Productivity Hub"
```

### 3. Install Project Packages

```powershell
npm.cmd install
```

This installs frontend and backend dependencies.

### 4. Start the App

```powershell
npm.cmd run dev
```

Open the frontend in your browser:

```text
http://localhost:5173
```

The backend health route is:

```text
http://localhost:5000/api/health
```

### 5. Create a MongoDB Atlas Database

1. Go to `https://www.mongodb.com/atlas`.
2. Create a free account or sign in.
3. Create a new free cluster.
4. Create a database user from Database Access.
5. Add your IP address from Network Access.
6. Click Connect on your cluster.
7. Choose Drivers.
8. Copy the MongoDB connection string.

It looks like this:

```text
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `USERNAME` and `PASSWORD` with the database user you created. Add the database name before the `?`:

```text
mongodb+srv://amolkumar:Amol909767@cluster0.grutovi.mongodb.net/?appName=Cluster0

mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/student-productivity-hub?retryWrites=true&w=majority
```

### 6. Create the Backend Environment File

Copy this file:

```text
backend/.env.example
```

Create a new file:

```text
backend/.env
```

Paste this inside `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/student-productivity-hub?retryWrites=true&w=majority
JWT_SECRET=change-this-to-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Save the file, stop the dev server with `Ctrl + C`, then restart:

```powershell
npm.cmd run dev
```

### 7. Login and Register

The frontend opens on the login/register screen. Registration calls the backend `/api/auth/register` route, creates the user in MongoDB, receives a JWT token, and stores the session in the browser.

After login you can use:

- Tasks: create, complete, move to in-progress, delete
- Assignments: create, submit, delete
- Habits: create, mark done today, archive
- Calendar: create and delete events
- Notes: create, search, favorite, delete
- Pomodoro: start and finish tracked focus sessions
- Analytics: live summary from saved data

## Deployment

### Backend on Render

1. Push this project to GitHub.
2. Open Render.
3. Create a new Web Service.
4. Connect your GitHub repository.
5. Set the root directory to:

```text
backend
```

6. Set build command:

```bash
npm install
```

7. Set start command:

```bash
npm start
```

8. Add these environment variables in Render:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
```

9. Deploy the backend.
10. Copy the Render backend URL. It will look like:

```text
https://student-productivity-hub-api.onrender.com
```

Your API URL is:

```text
https://student-productivity-hub-api.onrender.com/api
```

### Frontend on Vercel

1. Open Vercel.
2. Import the same GitHub repository.
3. Set the root directory to:

```text
frontend
```

4. Add this environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

5. Deploy the frontend.
6. Copy the Vercel frontend URL.
7. Go back to Render and update `CLIENT_ORIGINS` so it includes the real Vercel URL:

```env
CLIENT_ORIGINS=http://localhost:5173,https://your-real-vercel-url.vercel.app
```

8. Redeploy or restart the Render backend.

## Available Scripts

- `npm run dev` - run frontend and backend together
- `npm run build` - build the frontend
- `npm run start` - start the backend
- `npm run lint` - lint the frontend

## Core Modules

- Authentication
- Dashboard overview
- Task manager
- Assignment tracker
- Study planner
- Habit tracker
- Pomodoro timer
- Notes
- Calendar
- Analytics
- Settings and deployment guidance
