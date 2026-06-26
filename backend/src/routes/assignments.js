import express from "express";
import Assignment from "../models/Assignment.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const assignment = await Assignment.create({ ...req.body, user: req.user._id });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
