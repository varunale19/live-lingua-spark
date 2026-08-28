import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Meeting name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming",
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
