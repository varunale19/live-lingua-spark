import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function fixDBV2() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Meeting = mongoose.model("Meeting", new mongoose.Schema({}, { strict: false }));

  const meetings = await Meeting.find({});
  for (const m of meetings) {
    if (m.status === "scheduled") m.status = "upcoming";
    // If meeting is upcoming, clear artificial scheduledDate/scheduledTime
    if (m.status === "upcoming") {
      m.startedAt = null;
      m.endedAt = null;
      m.duration = null;
    } else if (m.status === "completed") {
      if (!m.startedAt) m.startedAt = m.createdAt || new Date();
      if (!m.endedAt) m.endedAt = m.updatedAt || new Date();
      if (!m.duration) {
        const diff = Math.max(0, new Date(m.endedAt) - new Date(m.startedAt));
        m.duration = Math.max(1, Math.round(diff / 60000));
      }
    }
    await m.save();
  }
  console.log("MongoDB meetings cleaned & standardized successfully:", meetings.length);
  process.exit(0);
}

fixDBV2();
