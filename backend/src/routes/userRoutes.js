import { Router } from "express";
import { getListeningLanguage, updateListeningLanguage, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/listening-language", getListeningLanguage);
router.put("/listening-language", updateListeningLanguage);
router.put("/profile", updateProfile);

export default router;
