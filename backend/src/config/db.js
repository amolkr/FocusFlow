import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const message = "MONGODB_URI is not set. Database-backed features will not work.";
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(message);
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
