import express from "express";
import Event from "../models/Event.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const start = req.query.start ? new Date(req.query.start) : new Date();
    const end = req.query.end ? new Date(req.query.end) : new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30);
    const events = await Event.find({ user: req.user._id, start: { $gte: start, $lte: end } }).sort({ start: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, user: req.user._id });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
