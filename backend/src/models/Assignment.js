import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: String,
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["not-started", "research", "drafting", "submitted"], default: "not-started" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    attachmentUrl: String
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
