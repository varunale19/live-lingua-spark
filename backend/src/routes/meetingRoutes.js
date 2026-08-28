import { Router } from "express";
import { createMeeting, joinMeeting, endMeeting, cancelMeeting, getMyMeetings, getRoomInfo } from "../controllers/meetingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Allow meeting end, cancellation, and room info queries with flexible auth
router.post("/end", endMeeting);
router.post("/cancel", cancelMeeting);

router.use(authMiddleware);

router.post("/create", createMeeting);
router.post("/join", joinMeeting);
router.get("/room-info/:meetingId", getRoomInfo);
router.get("/", getMyMeetings);

export default router;
