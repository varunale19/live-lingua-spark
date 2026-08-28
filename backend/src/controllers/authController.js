import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "lingualive_super_secret_jwt_key_2026";

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please provide name, email, and password." });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      listeningLanguage: "Telugu",
    });

    const token = generateToken(user._id.toString());
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        listeningLanguage: user.listeningLanguage,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration error." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Please provide email and password." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const token = generateToken(user._id.toString());
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        listeningLanguage: user.listeningLanguage,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login error." });
  }
}

export async function getMe(req, res) {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  res.json({
    success: true,
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      listeningLanguage: req.user.listeningLanguage,
      profilePicture: req.user.profilePicture || "",
    },
  });
}

export async function logout(req, res) {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully." });
}

export async function forgotPassword(req, res) {
  res.json({
    success: true,
    message: "If an account exists with this email, password reset instructions will be sent.",
  });
}

export async function googleAuthInit(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  console.log("[Google OAuth] Starting authentication");

  if (!clientId) {
    console.error("[Google OAuth] Error: GOOGLE_CLIENT_ID is not configured in backend environment.");
    return res.redirect(
      `${frontendUrl}?authError=${encodeURIComponent("Google OAuth is not configured on backend. Missing GOOGLE_CLIENT_ID.")}`
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    access_type: "offline",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(authUrl);
}

export async function googleAuthCallback(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  console.log("[Google OAuth] Callback received");

  const { code, error } = req.query;

  if (error) {
    console.warn("[Google OAuth] Callback received error from Google:", error);
    return res.redirect(
      `${frontendUrl}?authError=${encodeURIComponent("Google login was cancelled or failed.")}`
    );
  }

  if (!code) {
    return res.redirect(
      `${frontendUrl}?authError=${encodeURIComponent("Authorization code missing from Google callback.")}`
    );
  }

  if (!clientId || !clientSecret) {
    console.error("[Google OAuth] Missing Google Client ID or Secret in backend .env");
    return res.redirect(
      `${frontendUrl}?authError=${encodeURIComponent("Google OAuth credentials missing on backend.")}`
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("[Google OAuth] Token exchange error:", tokenData);
      return res.redirect(
        `${frontendUrl}?authError=${encodeURIComponent(
          tokenData.error_description || tokenData.error || "Failed to exchange code for Google token."
        )}`
      );
    }

    // 2. Fetch user details from Google userinfo API
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      const errText = await userinfoResponse.text();
      console.error("[Google OAuth] Userinfo fetch error:", errText);
      return res.redirect(
        `${frontendUrl}?authError=${encodeURIComponent("Failed to fetch Google profile information.")}`
      );
    }

    const googleUser = await userinfoResponse.json();
    const { sub, email, name, picture } = googleUser;

    if (!sub || !email) {
      return res.redirect(
        `${frontendUrl}?authError=${encodeURIComponent("Google account must provide email and user ID.")}`
      );
    }

    console.log(`[Google OAuth] User verified: ${email}`);

    // 3. Create or find corresponding user in MongoDB
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ googleId: sub }, { email: normalizedEmail }],
    });

    if (user) {
      let isUpdated = false;
      if (!user.googleId) {
        user.googleId = sub;
        isUpdated = true;
      }
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
        isUpdated = true;
      }
      if (isUpdated) {
        await user.save();
      }
    } else {
      user = await User.create({
        googleId: sub,
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        profilePicture: picture || "",
        listeningLanguage: "Telugu",
      });
    }

    console.log("[Google OAuth] User found/created");

    // 4. Create standard authentication session/JWT
    const token = generateToken(user._id.toString());
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("[Google OAuth] Login successful");

    // 5. Redirect user to frontend dashboard
    return res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  } catch (err) {
    console.error("[Google OAuth] Callback exception:", err);
    return res.redirect(
      `${frontendUrl}?authError=${encodeURIComponent("Internal error during Google authentication.")}`
    );
  }
}
