const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

const {
  uploadResume,
  analyzeResume,
  getResumeHistory,
  getResumeById,
  downloadResume,
  deleteResume,
  deleteAllResumes,
} = require("../controllers/resumeController");

// Every resume route now requires a logged-in user.
router.use(protect);

router.post(
  "/upload",
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        // multer / fileFilter errors land here (e.g. non-PDF upload,
        // file too large) instead of crashing to a raw 500 HTML page.
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadResume
);

router.post(
  "/analyze",
  analyzeResume
);

router.get(
  "/history",
  getResumeHistory
);

// NOTE: this must stay registered after any other literal single-segment
// GET routes above (e.g. "/history"), otherwise it would shadow them by
// matching "history" as an :id param.
router.get(
  "/:id",
  getResumeById
);

router.get(
  "/download/:id",
  downloadResume
);

router.delete(
  "/delete/:id",
  deleteResume
);

// Bulk delete - wipes all of the logged-in user's resumes/analyses.
router.delete(
  "/",
  deleteAllResumes
);

module.exports = router;