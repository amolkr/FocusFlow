import express from "express";
import Assignment from "../models/Assignment.js";
import Habit from "../models/Habit.js";
import PomodoroSession from "../models/PomodoroSession.js";
import StudySession from "../models/StudySession.js";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/summary", async (req, res, next) => {
  try {
    const user = req.user._id;
    const [completedTasks, pendingTasks, upcomingAssignments, habits, studySessions, pomodoros] = await Promise.all([
      Task.countDocuments({ user, status: "completed" }),
      Task.countDocuments({ user, status: { $ne: "completed" } }),
      Assignment.countDocuments({ user, dueDate: { $gte: new Date() }, status: { $ne: "submitted" } }),
      Habit.find({ user, active: true }),
      StudySession.find({ user }).sort({ startTime: -1 }).limit(100),
      PomodoroSession.countDocuments({ user, completed: true })
    ]);

    const studyMinutes = studySessions.reduce((total, session) => total + (session.durationMinutes || 0), 0);
    const habitCompletionRate = habits.length
      ? Math.round(habits.reduce((total, habit) => total + habit.completions.length, 0) / habits.length)
      : 0;

    res.json({
      completedTasks,
      pendingTasks,
      upcomingAssignments,
      studyHours: Math.round((studyMinutes / 60) * 10) / 10,
      pomodoros,
      habitCompletionRate,
      productivityScore: Math.min(100, completedTasks * 5 + pomodoros * 2 + Math.round(studyMinutes / 60))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
