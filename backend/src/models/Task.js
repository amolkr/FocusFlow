import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    category: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: Date,
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "weekly" }
    },
    status: { type: String, enum: ["todo", "in-progress", "completed"], default: "todo" },
    progress: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
