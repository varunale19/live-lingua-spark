import mongoose from "mongoose";

const meetingEventSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listeningLanguage: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    translatedSegmentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const MeetingEvent = mongoose.model("MeetingEvent", meetingEventSchema);
