const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validatePassword } = require("../utils/passwordPolicy");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// ==============================
// Register
// ==============================

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Login
// ==============================

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password +failedLoginAttempts +lastFailedLoginAt +lockUntil"
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.isLoginLocked()) {
      return res.status(429).json({
        success: false,
        message: "Too many failed login attempts. Please try again after 15 minutes.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.registerFailedLogin();

      if (user.isLoginLocked()) {
        return res.status(429).json({
          success: false,
          message: "Too many failed login attempts. Please try again after 15 minutes.",
        });
      }

      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    await user.resetLoginAttempts();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Current user (session restore)
// ==============================

exports.getMe = async (req, res) => {
  try {
    // req.user is attached by the `protect` middleware
    return res.status(200).json({
      success: true,
      user: publicUser(req.user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Forgot password
// ==============================
// NOTE: This project has no email/SMTP transport configured (no nodemailer,
// no API key for an email provider). Sending the reset link by email is a
// one-line addition once that's wired up (see comment below). Until then,
// in non-production environments the raw reset token is returned in the
// response so the flow is fully testable end-to-end; in production it is
// never returned in the response body.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond the same way whether or not the account exists,
    // so this endpoint can't be used to enumerate registered emails.
    const genericResponse = {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: wire up an email provider (e.g. nodemailer + SMTP, Resend, SendGrid)
    // and send `resetUrl` to the user's email instead of returning it below.
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${rawToken}`;

    if (process.env.NODE_ENV === "production") {
      return res.status(200).json(genericResponse);
    }

    return res.status(200).json({
      ...genericResponse,
      devResetToken: rawToken,
      devResetUrl: resetUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Reset password
// ==============================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "That reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token: authToken,
      user: publicUser(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
