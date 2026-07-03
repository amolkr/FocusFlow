import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import assignmentRoutes from "./routes/assignments.js";
import studyRoutes from "./routes/study.js";
import habitRoutes from "./routes/habits.js";
import noteRoutes from "./routes/notes.js";
import eventRoutes from "./routes/events.js";
import pomodoroRoutes from "./routes/pomodoro.js";
import analyticsRoutes from "./routes/analytics.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "focus-flow-api",
    databaseConfigured: Boolean(process.env.MONGODB_URI)
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
});
