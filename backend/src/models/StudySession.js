import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    topic: String,
    startTime: { type: Date, required: true },
    endTime: Date,
    durationMinutes: { type: Number, default: 0 },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("StudySession", studySessionSchema);
