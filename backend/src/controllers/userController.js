import { User } from "../models/User.js";

export async function getListeningLanguage(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    res.json({
      success: true,
      listeningLanguage: req.user.listeningLanguage || "Telugu",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching listening language" });
  }
}

export async function updateListeningLanguage(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { listeningLanguage } = req.body;
    if (!listeningLanguage) {
      res.status(400).json({ success: false, message: "Listening language is required" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { listeningLanguage },
      { new: true }
    );

    res.json({
      success: true,
      listeningLanguage: updatedUser?.listeningLanguage,
      message: "Listening language preference updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating listening language" });
  }
}

export async function updateProfile(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, email, profilePicture } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.json({
      success: true,
      user: {
        id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        profilePicture: updatedUser?.profilePicture,
        listeningLanguage: updatedUser?.listeningLanguage,
      },
      message: "Profile updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
}
