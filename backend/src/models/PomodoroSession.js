import mongoose from "mongoose";

const pomodoroSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: String,
    focusMinutes: { type: Number, default: 25 },
    breakMinutes: { type: Number, default: 5 },
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("PomodoroSession", pomodoroSessionSchema);
