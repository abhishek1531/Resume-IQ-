const User = require("../models/User");
const Resume = require("../models/Resume");
const { validatePassword } = require("../utils/passwordPolicy");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// ==============================
// Profile + analysis stats
// ==============================
// "Analyses" here means resumes that have actually been run through the
// job-description matcher (i.e. have a jobDescription saved) - a resume
// that's only been uploaded but never analyzed doesn't count yet.

exports.getProfile = async (req, res) => {
  try {
    const analyzed = await Resume.find({
      user: req.user._id,
      jobDescription: { $ne: "" },
    }).select("atsScore");

    const totalAnalyses = analyzed.length;

    const averageATSScore =
      totalAnalyses === 0
        ? 0
        : Math.round(
            analyzed.reduce((sum, r) => sum + (r.atsScore || 0), 0) / totalAnalyses
          );

    const highestATSScore =
      totalAnalyses === 0 ? 0 : Math.max(...analyzed.map((r) => r.atsScore || 0));

    return res.status(200).json({
      success: true,
      user: publicUser(req.user),
      stats: {
        totalAnalyses,
        averageATSScore,
        highestATSScore,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Update profile (name only - email is immutable)
// ==============================

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (name.trim().length < 2 || name.trim().length > 60) {
      return res
        .status(400)
        .json({ success: false, message: "Name must be between 2 and 60 characters" });
    }

    req.user.name = name.trim();
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(req.user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Change password
// ==============================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    // req.user came from the `protect` middleware without the password
    // field (select: false on the schema) - re-fetch it with the hash.
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const isSameAsCurrent = await user.comparePassword(newPassword);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    user.password = newPassword; // pre-save hook re-hashes it
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
