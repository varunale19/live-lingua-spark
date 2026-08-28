import mongoose from "mongoose";

const meetingParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meetingId: {
      type: String,
      required: true,
    },
    listeningLanguage: {
      type: String,
      required: true,
      default: "Telugu",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const MeetingParticipant = mongoose.model("MeetingParticipant", meetingParticipantSchema);
