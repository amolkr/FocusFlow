import express from "express";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const query = { user: req.user._id };
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
