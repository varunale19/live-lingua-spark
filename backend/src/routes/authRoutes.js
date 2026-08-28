import { Router } from "express";
import {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  googleAuthInit,
  googleAuthCallback,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);

// Google OAuth routes
router.get("/google", googleAuthInit);
router.get("/google/callback", googleAuthCallback);

export default router;
