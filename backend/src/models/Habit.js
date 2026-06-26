import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetDays: [{ type: Number, min: 0, max: 6 }],
    completions: [{ date: Date }],
    streak: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
