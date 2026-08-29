import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Meeting } from "../models/Meeting.js";
import { MeetingParticipant } from "../models/MeetingParticipant.js";

function generateMeetingPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

function formatDate(d) {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(d) {
  if (!d) return "—";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "—";
  return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export async function createMeeting(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Meeting name is required" });
      return;
    }

    const randomCode = Math.floor(100000000 + Math.random() * 900000000).toString();
    const meetingId = `${randomCode.slice(0, 3)}-${randomCode.slice(3, 6)}-${randomCode.slice(6)}`;
    
    // Generate secure random meeting password and hash it
    const plainPassword = generateMeetingPassword();
    const salt = await bcrypt.genSalt(10);
    const meetingPasswordHash = await bcrypt.hash(plainPassword, salt);

    const newMeeting = await Meeting.create({
      meetingId,
      name: name.trim(),
      description: (description || "").trim(),
      meetingPasswordHash,
      hostId: req.user._id,
      status: "upcoming",
      startedAt: null,
      endedAt: null,
      duration: null,
    });

    await MeetingParticipant.create({
      userId: req.user._id,
      meetingId,
      listeningLanguage: req.user.listeningLanguage || "Telugu",
    });

    // Return plain-text password ONCE to authenticated host
    res.status(201).json({
      success: true,
      meeting: {
        id: newMeeting._id.toString(),
        meetingId: newMeeting.meetingId,
        password: plainPassword,
        name: newMeeting.name,
        description: newMeeting.description,
        status: newMeeting.status,
        meetingLink: `http://localhost:5173/room?id=${newMeeting.meetingId}`,
        listeningLanguage: req.user.listeningLanguage || "Telugu",
      },
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ success: false, message: "Error creating meeting" });
  }
}

export async function verifyMeeting(req, res) {
  try {
    const { meetingId, password } = req.body;
    if (!meetingId || !meetingId.trim()) {
      return res.status(400).json({ success: false, message: "Meeting ID is required." });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, message: "Meeting password is required." });
    }

    const cleanMeetingId = meetingId.trim();
    const meeting = await Meeting.findOne({ meetingId: cleanMeetingId });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    if (meeting.meetingPasswordHash) {
      const isMatch = await bcrypt.compare(password.trim(), meeting.meetingPasswordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect meeting password." });
      }
    }

    return res.json({
      success: true,
      meetingId: cleanMeetingId,
      name: meeting.name,
      status: meeting.status,
      message: "Meeting credentials verified.",
    });
  } catch (error) {
    console.error("Error verifying meeting:", error);
    return res.status(500).json({ success: false, message: "Error verifying meeting" });
  }
}

export async function joinMeeting(req, res) {
  try {
    const { meetingId, password, listeningLanguage } = req.body;
    if (!meetingId) {
      res.status(400).json({ success: false, message: "Meeting ID is required" });
      return;
    }

    const cleanMeetingId = meetingId.trim();

    const meeting = await Meeting.findOne({ meetingId: cleanMeetingId });
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    // Verify password if provided / required
    if (password && meeting.meetingPasswordHash) {
      const isMatch = await bcrypt.compare(password.trim(), meeting.meetingPasswordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect meeting password." });
      }
    }

    if (meeting.status === "upcoming" || meeting.status === "scheduled") {
      meeting.status = "live";
      if (!meeting.startedAt) {
        meeting.startedAt = new Date();
      }
      await meeting.save();
    }

    const userId = req.user ? req.user._id : "6a80a678c18df3e95089c166";
    let participant = await MeetingParticipant.findOne({
      userId,
      meetingId: cleanMeetingId,
    });

    const userLang = listeningLanguage || (req.user ? req.user.listeningLanguage : "Telugu") || "Telugu";

    if (participant) {
      participant.listeningLanguage = userLang;
      participant.joinedAt = new Date();
      await participant.save();
    } else {
      participant = await MeetingParticipant.create({
        userId,
        meetingId: cleanMeetingId,
        listeningLanguage: userLang,
      });
    }

    res.json({
      success: true,
      meetingId: cleanMeetingId,
      listeningLanguage: participant.listeningLanguage,
      status: meeting ? meeting.status : "live",
      message: "Ready to join. Speak naturally in any language.",
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({ success: false, message: "Error joining meeting" });
  }
}

export async function getRoomInfo(req, res) {
  try {
    const { meetingId } = req.params;
    if (!meetingId) {
      return res.status(400).json({ success: false, message: "Meeting ID is required" });
    }

    const cleanId = meetingId.trim();
    const meeting = await Meeting.findOne({ meetingId: cleanId }).populate("hostId", "name email");

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const currentUserId = req.user ? String(req.user._id) : null;
    const meetingHostId = meeting.hostId ? String(meeting.hostId._id || meeting.hostId) : null;
    const isHost = Boolean(currentUserId && meetingHostId && currentUserId === meetingHostId);

    if (isHost) {
      return res.json({
        success: true,
        role: "HOST",
        isHost: true,
        meeting: {
          meetingId: meeting.meetingId,
          name: meeting.name,
          description: meeting.description,
          status: meeting.status,
          hostName: meeting.hostId?.name || "Host",
          startedAt: meeting.startedAt,
          endedAt: meeting.endedAt,
          createdAt: meeting.createdAt,
        },
      });
    } else {
      // Participant-safe view: NO host private info, internal timestamps or management data!
      return res.json({
        success: true,
        role: "PARTICIPANT",
        isHost: false,
        meeting: {
          meetingId: meeting.meetingId,
          name: meeting.name,
          status: meeting.status,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching room info:", error);
    res.status(500).json({ success: false, message: "Error fetching room info" });
  }
}

export async function endMeeting(req, res) {
  try {
    const { meetingId } = req.body;
    if (meetingId) {
      const meeting = await Meeting.findOne({ meetingId: meetingId.trim() });
      if (meeting && meeting.status !== "completed") {
        if (req.user && String(meeting.hostId) !== String(req.user._id)) {
          return res.status(403).json({ success: false, message: "Only the meeting host can end the meeting" });
        }
        const endedTime = new Date();
        meeting.status = "completed";
        meeting.endedAt = endedTime;
        
        if (!meeting.startedAt) {
          meeting.startedAt = meeting.createdAt || endedTime;
        }

        const diffMs = Math.max(0, endedTime.getTime() - meeting.startedAt.getTime());
        const calculatedDurationMin = Math.max(1, Math.round(diffMs / (1000 * 60)));
        meeting.duration = calculatedDurationMin;

        await meeting.save();
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error ending meeting:", error);
    res.status(500).json({ success: false, message: "Error ending meeting" });
  }
}

export async function cancelMeeting(req, res) {
  try {
    const { meetingId } = req.body;
    if (!meetingId) {
      res.status(400).json({ success: false, message: "Meeting ID required" });
      return;
    }

    const cleanId = meetingId.trim();
    await Meeting.deleteOne({ meetingId: cleanId });
    await MeetingParticipant.deleteMany({ meetingId: cleanId });

    return res.json({ success: true, message: "Meeting permanently deleted" });
  } catch (error) {
    console.error("Error cancelling/deleting meeting:", error);
    res.status(500).json({ success: false, message: "Error deleting meeting" });
  }
}

export async function getMyMeetings(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const meetings = await Meeting.find({ hostId: req.user._id }).sort({ createdAt: -1 });
    const nowTime = Date.now();

    const formattedMeetings = await Promise.all(
      meetings.map(async (m) => {
        const dbParticipants = await MeetingParticipant.find({ meetingId: m.meetingId }).populate(
          "userId",
          "name email"
        );

        let status = m.status || "upcoming";
        if (status === "scheduled") status = "upcoming";

        let dateDisplay = formatDate(m.createdAt);
        let timeDisplay = "—";
        let durationDisplay = "—";
        let durationLabel = "";
        let elapsedMinutes = 0;

        if (status === "live") {
          const startObj = m.startedAt || m.createdAt;
          dateDisplay = formatDate(startObj);
          timeDisplay = `Started ${formatTime(startObj)}`;
          elapsedMinutes = Math.max(1, Math.floor((nowTime - new Date(startObj).getTime()) / (1000 * 60)));
          durationDisplay = `Elapsed: ${elapsedMinutes} min`;
          durationLabel = "Live";
        } else if (status === "completed") {
          const startObj = m.startedAt || m.createdAt;
          const endObj = m.endedAt || m.updatedAt || new Date();
          dateDisplay = formatDate(endObj);
          timeDisplay = `Ended ${formatTime(endObj)}`;

          let actualMin = m.duration;
          if (!actualMin && startObj && endObj) {
            actualMin = Math.max(1, Math.round((new Date(endObj).getTime() - new Date(startObj).getTime()) / (1000 * 60)));
          }
          durationDisplay = `${actualMin || 1} min`;
          durationLabel = "Actual";
        } else {
          // Upcoming
          dateDisplay = formatDate(m.createdAt);
          timeDisplay = "—";
          durationDisplay = "—";
          durationLabel = "";
        }

        const participantsList = dbParticipants.map((p, idx) => {
          const u = p.userId;
          const userName = u?.name || (idx === 0 ? req.user.name || "varun" : idx === 1 ? "bhuvan" : "sai");
          return {
            name: userName.toLowerCase(),
            displayName: userName,
            listeningLanguage: p.listeningLanguage || "Telugu",
          };
        });

        return {
          id: m._id.toString(),
          meetingId: m.meetingId,
          name: m.name,
          description: m.description,
          status: status,
          date: dateDisplay,
          time: timeDisplay,
          duration: durationDisplay,
          durationLabel: durationLabel,
          elapsedMinutes: elapsedMinutes,
          startedAt: m.startedAt ? m.startedAt.toISOString() : null,
          endedAt: m.endedAt ? m.endedAt.toISOString() : null,
          createdAt: m.createdAt ? m.createdAt.toISOString() : null,
          participants: participantsList,
          isHost: String(m.hostId) === String(req.user._id),
        };
      })
    );

    res.json({
      success: true,
      meetings: formattedMeetings,
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ success: false, message: "Error fetching meetings" });
  }
}
