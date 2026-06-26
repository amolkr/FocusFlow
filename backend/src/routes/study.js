import express from "express";
import StudySession from "../models/StudySession.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const session = await StudySession.create({ ...req.body, user: req.user._id });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const session = await StudySession.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!session) return res.status(404).json({ message: "Study session not found" });
    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
