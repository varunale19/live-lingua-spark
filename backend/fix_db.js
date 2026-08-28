import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function fixDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Meeting = mongoose.model("Meeting", new mongoose.Schema({}, { strict: false }));

  const meetings = await Meeting.find({});
  for (const m of meetings) {
    if (!m.scheduledDate) m.scheduledDate = "Aug 23, 2026";
    if (!m.scheduledTime) m.scheduledTime = "09:41 PM";
    if (!m.plannedDuration) m.plannedDuration = 35;
    if (m.status === "scheduled") m.status = "upcoming";
    await m.save();
  }
  console.log("Database meetings repaired successfully:", meetings.length);
  process.exit(0);
}

fixDB();
