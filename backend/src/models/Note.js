import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: String,
    content: { type: String, default: "" },
    favorite: { type: Boolean, default: false },
    tags: [String]
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("Note", noteSchema);
