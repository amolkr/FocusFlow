import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    firebaseUid: { type: String, index: true },
    avatarUrl: String,
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      notifications: { type: Boolean, default: true },
      dailyGoalHours: { type: Number, default: 3 }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
