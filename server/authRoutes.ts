import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { hashPassword, comparePassword } from "./customAuth";
import { hashToken } from "./utils/hashToken";
import { loginRateLimiter, passwordResetRateLimiter, authRateLimiter } from "./middleware/rateLimiter";
import passport from "passport";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emails/emailService";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// POST /api/auth/register
router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Generate email verification token
    const verificationToken = nanoid(32);
    const hashedVerificationToken = hashToken(verificationToken);

    // Create user with email verification required
    const user = await storage.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      emailVerified: false,
      emailVerificationToken: hashedVerificationToken,
    });

    // Send verification email
    const host = req.get('host');
    const baseUrl = host ? `${req.protocol}://${host}` : 'http://localhost:5000';
    try {
      await sendVerificationEmail(
        user.email,
        user.firstName || 'User',
        verificationToken,
        baseUrl
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue registration even if email fails
    }

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", loginRateLimiter, (req, res, next) => {
  try {
    loginSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
  }

  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: info?.message || "Invalid credentials" 
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
      });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logout successful" });
  });
});

// GET /api/auth/verify-email/:token
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Verify email and clear token
    await storage.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", passwordResetRateLimiter, async (req, res) => {
  try {
    const data = resetPasswordRequestSchema.parse(req.body);

    const user = await storage.getUserByEmail(data.email);
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.json({ 
        message: "If an account exists with that email, a password reset link has been sent." 
      });
    }

    // Generate reset token and expiry (1 hour)
    const resetToken = nanoid(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Hash token before storing
    const hashedToken = hashToken(resetToken);

    await storage.updateUser(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: resetExpires,
    });

    // Send password reset email
    const host = req.get('host');
    const baseUrl = host ? `${req.protocol}://${host}` : 'http://localhost:5000';
    try {
      await sendPasswordResetEmail(
        user.email,
        user.firstName || 'User',
        resetToken,
        baseUrl
      );
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Continue even if email fails
    }

    const response = {
      message: "If an account exists with that email, a password reset link has been sent.",
    };

    // In development, include reset link
    if (process.env.NODE_ENV !== "production") {
      (response as any).resetUrl = `/reset-password/${resetToken}`;
    }

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", passwordResetRateLimiter, async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(data.token);

    // Find user by hashed reset token
    const user = await storage.getUserByResetToken(hashedToken);
    
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.password);

    // Update password and clear reset token
    await storage.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Invalidate all sessions for this user (security best practice)
    await storage.invalidateUserSessions(user.id);

    res.json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/auth/user - Get current user
router.get("/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = req.user as any;
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    emailVerified: user.emailVerified,
    profileImageUrl: user.profileImageUrl,
  });
});

export default router;
