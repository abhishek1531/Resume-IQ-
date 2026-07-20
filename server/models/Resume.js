const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // Owning user. Optional (not `required`) so that any resumes created
    // before authentication was added continue to load without errors.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    // Optional label the user gives an analysis run (e.g. "Frontend Engineer
    // @ Acme"). Purely cosmetic - not used by the ATS/JD-matching engines.
    jobTitle: {
      type: String,
      default: "",
    },

    resumeText: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      default: "",
    },

    atsScore: {
      type: Number,
      default: 0,
    },

    matchPercentage: {
      type: Number,
      default: 0,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    aiScore: {
      type: Number,
      default: 0,
    },

    // Per-category AI evaluation ("Strong" / "Good" / "Needs improvement")
    // powering the dynamic "AI evaluated" checklist on the report. Keyed by
    // category (resumeClarity, relevanceToJD, etc) - see
    // server/services/geminiService.js for the fixed category list. May be
    // partially populated (or empty) if Gemini didn't return a rating for
    // every category; the frontend falls back to a plain checklist item
    // for any category with no stored value.
    categoryEvaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);