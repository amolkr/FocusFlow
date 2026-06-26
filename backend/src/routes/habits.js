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

    habit.completions.push({ date: req.body.date ? new Date(req.body.date) : new Date() });
    habit.streak += 1;
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

export default router;
