import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
    preferredLanguage: {
      type: String,
      required: [true, "Preferred language is required"],
      trim: true,
      default: "English",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    lastMeetingAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find user contacts by email
contactSchema.index({ ownerId: 1, email: 1 });

export const Contact = mongoose.model("Contact", contactSchema);
