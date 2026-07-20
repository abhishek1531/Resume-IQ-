const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never return password by default
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    // --- Brute-force login protection ---
    // Consecutive failed login attempts within the current 15-minute
    // window. Reset to 0 on a successful login, or when a failed attempt
    // arrives after the window has already expired.
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    // Timestamp of the most recent failed login attempt - used to decide
    // whether a new failure still falls inside the 15-minute window.
    lastFailedLoginAt: {
      type: Date,
      select: false,
    },
    // If set and in the future, login is temporarily blocked until this
    // time. The account itself is never permanently locked.
    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if it was modified)
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare a plaintext password with the stored hash
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// True while the account is inside an active brute-force lockout window.
userSchema.methods.isLoginLocked = function isLoginLocked() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

// Records one failed login attempt. If 5 consecutive failures land within
// a rolling 15-minute window, temporarily locks login for 15 minutes.
// The account itself is never permanently locked - it just clears once
// the lock window passes.
userSchema.methods.registerFailedLogin = async function registerFailedLogin() {
  const now = Date.now();
  const withinWindow =
    this.lastFailedLoginAt && now - this.lastFailedLoginAt.getTime() < LOGIN_ATTEMPT_WINDOW_MS;

  this.failedLoginAttempts = (withinWindow ? this.failedLoginAttempts : 0) + 1;
  this.lastFailedLoginAt = new Date(now);

  if (this.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(now + LOCK_DURATION_MS);
    this.failedLoginAttempts = 0;
  }

  await this.save({ validateBeforeSave: false });
};

// Clears any failed-attempt/lock state after a successful login.
userSchema.methods.resetLoginAttempts = async function resetLoginAttempts() {
  if (!this.failedLoginAttempts && !this.lockUntil && !this.lastFailedLoginAt) return;
  this.failedLoginAttempts = 0;
  this.lastFailedLoginAt = undefined;
  this.lockUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

// Generates a one-time reset token, stores its (hashed) fingerprint on the
// user, and returns the raw token — the raw value is what gets emailed /
// returned to the client; only the hash is persisted in the DB.
userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return rawToken;
};

// Never leak the password hash if a document is ever serialized directly
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
