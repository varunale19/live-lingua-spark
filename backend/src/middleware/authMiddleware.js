import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function authMiddleware(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: "Authentication token missing." });
      return;
    }

    const secret = process.env.JWT_SECRET || "lingualive_super_secret_jwt_key_2026";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}
