import express from "express";
import PomodoroSession from "../models/PomodoroSession.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const sessions = await PomodoroSession.find({ user: req.user._id }).sort({ startedAt: -1 }).limit(50);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const session = await PomodoroSession.create({ ...req.body, user: req.user._id });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/finish", async (req, res, next) => {
  try {
    const session = await PomodoroSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { completed: true, endedAt: new Date() },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Pomodoro session not found" });
    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
