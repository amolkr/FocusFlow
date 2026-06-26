import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["class", "exam", "assignment", "study", "personal"], default: "study" },
    start: { type: Date, required: true },
    end: Date,
    location: String,
    reminderMinutes: { type: Number, default: 30 }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
