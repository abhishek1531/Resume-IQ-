const fs = require("fs");
const path = require("path");
const extractText = require("../utils/extractText");
const Resume = require("../models/Resume");
const calculateATS = require("../utils/atsEngine");
const matchResumeWithJD = require("../utils/jobMatcher");
const analyzeWithGemini = require("../services/geminiService");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// ==============================
// Upload Resume
// ==============================

exports.uploadResume = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Resume Uploaded"
      });
    }

    const resumeText = await extractText(req.file.path);

    if (!resumeText) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "Unable to extract text from PDF"
      });
    }

    const ats = calculateATS(resumeText);

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.filename,
      resumeText,
      atsScore: ats.atsScore,
      matchedSkills: ats.foundSkills,
      missingSkills: ats.missingSkills
    });

    return res.status(200).json({
      success: true,
      message: "Resume Uploaded Successfully",
      resumeId: resume._id,
      atsScore: ats.atsScore,
      breakdown: ats.breakdown,
      foundSkills: ats.foundSkills,
      missingSkills: ats.missingSkills
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ==============================
// Analyze Resume
// ==============================

exports.analyzeResume = async (req, res) => {

  try {

    const { resumeId, jobDescription, jobTitle } = req.body;

    if (!resumeId || !jobDescription) {

      return res.status(400).json({
        success: false,
        message: "resumeId and jobDescription are required"
      });

    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {

      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });

    }

    // Ownership check: only the resume's uploader may analyze it.
    // (Resumes created before auth existed have no `user` and are skipped
    // here so they don't break — see the Resume model comment.)
    if (resume.user && resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this resume"
      });
    }

    // JD Matching

    const jdResult = matchResumeWithJD(
      resume.resumeText,
      jobDescription
    );

    // Gemini AI
    // Wrapped so a Gemini outage/quota error/bad JSON response doesn't fail
    // the whole analysis - the ATS score and JD match above are still real
    // and worth saving even if the AI portion is temporarily unavailable.

    let aiResult = { strengths: [], weaknesses: [], suggestions: [], scoreOutOf100: resume.aiScore || 0 };
    let aiAvailable = true;

    try {
      aiResult = await analyzeWithGemini(resume.resumeText, jobDescription);
    } catch (aiError) {
      console.log("Gemini analysis failed:", aiError.message);
      aiAvailable = false;
    }

    // Save Result

    resume.jobDescription = jobDescription;

    if (jobTitle && jobTitle.trim()) {
      resume.jobTitle = jobTitle.trim();
    }

    resume.matchPercentage = jdResult.percentage;

    resume.matchedSkills = jdResult.matchedSkills;

    resume.missingSkills = jdResult.missingSkills;

    if (aiAvailable) {
      resume.strengths = aiResult.strengths;
      resume.weaknesses = aiResult.weaknesses;
      resume.suggestions = aiResult.suggestions;
      resume.aiScore = aiResult.scoreOutOf100;
      resume.categoryEvaluation = aiResult.categoryEvaluation || {};
    }

    await resume.save();

    return res.status(200).json({

      success: true,

      resumeId: resume._id,

      fileName: resume.fileName,

      jobTitle: resume.jobTitle,

      createdAt: resume.createdAt,

      atsScore: resume.atsScore,

      aiScore: resume.aiScore,

      aiAvailable,

      matchPercentage: resume.matchPercentage,

      matchedSkills: resume.matchedSkills,

      missingSkills: resume.missingSkills,

      strengths: resume.strengths,

      weaknesses: resume.weaknesses,

      suggestions: resume.suggestions,

      categoryEvaluation: resume.categoryEvaluation || {}

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// ==============================
// Resume History
// ==============================

exports.getResumeHistory = async (req, res) => {
  try {

    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select(
        "fileName jobTitle atsScore aiScore matchPercentage matchedSkills missingSkills strengths weaknesses suggestions jobDescription createdAt"
      );

    return res.status(200).json({
      success: true,
      total: resumes.length,
      resumes,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==============================
// Get Single Resume / Analysis
// ==============================

exports.getResumeById = async (req, res) => {
  try {

    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    if (resume.user && resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this resume"
      });
    }

    // Best-effort inference of whether the AI portion of the last analysis
    // succeeded. There's no persisted flag for this (Resume only stores the
    // outcome), so: if a job description was analyzed but no AI feedback
    // ended up saved, treat it as unavailable rather than "no feedback".
    const aiAvailable = !(
      resume.jobDescription &&
      resume.strengths.length === 0 &&
      resume.weaknesses.length === 0 &&
      resume.suggestions.length === 0
    );

    return res.status(200).json({
      success: true,
      resumeId: resume._id,
      fileName: resume.fileName,
      jobTitle: resume.jobTitle,
      jobDescription: resume.jobDescription,
      createdAt: resume.createdAt,
      atsScore: resume.atsScore,
      aiScore: resume.aiScore,
      aiAvailable,
      matchPercentage: resume.matchPercentage,
      matchedSkills: resume.matchedSkills,
      missingSkills: resume.missingSkills,
      strengths: resume.strengths,
      weaknesses: resume.weaknesses,
      suggestions: resume.suggestions,
      categoryEvaluation: resume.categoryEvaluation || {}
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ==============================
// Download Resume
// ==============================

exports.downloadResume = async (req, res) => {
  try {

    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    if (resume.user && resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this resume"
      });
    }

    const filePath = path.join(UPLOAD_DIR, resume.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "The original file is no longer available on the server"
      });
    }

    return res.download(filePath, resume.fileName);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ==============================
// Delete Resume
// ==============================

exports.deleteResume = async (req, res) => {
  try {

    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    if (resume.user && resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this resume"
      });
    }

    await Resume.findByIdAndDelete(id);

    // Also remove the underlying file so uploads/ doesn't accumulate
    // orphaned resumes forever. Best-effort — a missing file shouldn't
    // fail the delete since the DB record is already gone.
    const filePath = path.join(UPLOAD_DIR, resume.fileName);
    fs.unlink(filePath, () => {});

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ==============================
// Delete All Resumes / History
// ==============================

exports.deleteAllResumes = async (req, res) => {
  try {

    const resumes = await Resume.find({ user: req.user._id }).select("fileName");

    await Resume.deleteMany({ user: req.user._id });

    // Best-effort cleanup of the underlying files - a missing file
    // shouldn't fail the request since the DB records are already gone.
    resumes.forEach((resume) => {
      const filePath = path.join(UPLOAD_DIR, resume.fileName);
      fs.unlink(filePath, () => {});
    });

    return res.status(200).json({
      success: true,
      message: "All analysis history deleted successfully"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};