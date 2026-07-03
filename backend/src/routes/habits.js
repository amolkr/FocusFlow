import express from "express";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, active: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user._id });
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/complete", async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const completedAt = req.body.date ? new Date(req.body.date) : new Date();
    const alreadyCompletedToday = habit.completions.some((completion) => isSameDay(completion.date, completedAt));

    if (alreadyCompletedToday) {
      return res.json(habit);
    }

    habit.completions.push({ date: completedAt });
    habit.streak = calculateStreak(habit.completions.map((completion) => completion.date));
    await habit.save();

    res.json(habit);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { active: false }, { new: true });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function calculateStreak(dates) {
  const days = [...new Set(dates.map((date) => new Date(date).toISOString().slice(0, 10)))].sort().reverse();
  if (!days.length) return 0;

  let streak = 1;
  let cursor = new Date(`${days[0]}T00:00:00.000Z`);

  for (const day of days.slice(1)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (day !== cursor.toISOString().slice(0, 10)) break;
    streak += 1;
  }

  return streak;
}

export default router;
