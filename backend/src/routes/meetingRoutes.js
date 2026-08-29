import { Router } from "express";
import {
  createMeeting,
  verifyMeeting,
  joinMeeting,
  endMeeting,
  cancelMeeting,
  getMyMeetings,
  getRoomInfo,
} from "../controllers/meetingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Allow meeting end, cancellation, verification, and room info queries
router.post("/verify", verifyMeeting);
router.post("/end", endMeeting);
router.post("/cancel", cancelMeeting);

router.use(authMiddleware);

router.post("/create", createMeeting);
router.post("/join", joinMeeting);
router.get("/room-info/:meetingId", getRoomInfo);
router.get("/", getMyMeetings);

export default router;
