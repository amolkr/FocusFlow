import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user._id);

    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ token: signToken(user._id), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    preferences: user.preferences
  };
}

export default router;
