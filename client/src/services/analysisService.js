import api from "./api";

// The backend has no separate "Analysis" collection - each Resume document
// IS the analysis (a resume is re-analyzed in place against a new job
// description each time). This service adapts that model onto the shape
// the UI expects: an "analysis" object with its own _id, jobTitle, scores,
// etc., keyed by the underlying resume's id.

const stripTimestampPrefix = (fileName = "") => fileName.replace(/^\d+-/, "");

// Builds the plain-language "Why this score?" blurb shown on the analysis
// detail page. Derived entirely from values already returned by the API
// (no new backend fields needed) so it stays in sync with whatever the
// ATS engine / job matcher / Gemini actually produced for this analysis.
const explainScore = (r) => {
  const lines = [];

  const skillCount = (r.matchedSkills || []).length;
  lines.push(
    `ATS Score (${r.atsScore ?? 0}/100) comes from a rule-based scan of your resume text - ` +
      `it checks for recognized technical skills (${skillCount} found), project mentions, education, ` +
      `internship/training experience, achievements, and profile links like GitHub or LinkedIn.`
  );

  if (r.aiAvailable === false) {
    lines.push(
      "AI Score is unavailable for this run - Gemini couldn't be reached, so no qualitative AI " +
        "assessment of the resume's writing and relevance was generated this time."
    );
  } else {
    lines.push(
      `AI Score (${r.aiScore ?? 0}/100) reflects Gemini's qualitative read of the resume against the ` +
        `job description - judging clarity, relevance, and overall impact rather than just keyword counts.`
    );
  }

  const missingCount = (r.missingSkills || []).length;
  lines.push(
    `Job Match (${r.matchPercentage ?? 0}%) is the share of skills explicitly requested in the job ` +
      `description that were also found in your resume` +
      (missingCount > 0
        ? `, with ${missingCount} required skill${missingCount === 1 ? "" : "s"} still missing.`
        : ", with none missing.")
  );

  return lines.join(" ");
};

const mapAnalysis = (r) => ({
  _id: r.resumeId || r._id,
  jobTitle: r.jobTitle && r.jobTitle.trim() ? `${r.jobTitle.trim()} Analysis` : "Resume Analysis",
  createdAt: r.createdAt,
  atsScore: r.atsScore,
  aiScore: r.aiAvailable === false ? null : r.aiScore,
  aiAvailable: r.aiAvailable !== false,
  jobMatch: r.matchPercentage,
  matchedSkills: r.matchedSkills || [],
  missingSkills: r.missingSkills || [],
  strengths: r.strengths || [],
  weaknesses: r.weaknesses || [],
  suggestions: r.suggestions || [],
  scoreExplanation: explainScore(r),
  categoryEvaluation: r.categoryEvaluation || {},
  resume: { originalName: stripTimestampPrefix(r.fileName || "") },
});

const analyzeResume = async (resumeId, jobDescription, jobTitle) => {
  const { data } = await api.post("/resume/analyze", {
    resumeId,
    jobDescription,
    jobTitle,
  });
  return mapAnalysis(data);
};

// Only resumes that have actually been run against a job description count
// as "analyses" - a resume that's only been uploaded doesn't show up here.
const fetchAnalyzedResumes = async () => {
  const { data } = await api.get("/resume/history");
  return (data.resumes || [])
    .filter((r) => r.jobDescription && r.jobDescription.trim().length > 0)
    .map(mapAnalysis);
};

const getHistory = async (search = "") => {
  const items = await fetchAnalyzedResumes();
  if (!search) return items;
  const term = search.toLowerCase();
  return items.filter(
    (a) =>
      a.jobTitle.toLowerCase().includes(term) ||
      a.resume.originalName.toLowerCase().includes(term)
  );
};

const getRecent = async () => {
  const items = await fetchAnalyzedResumes();
  return items.slice(0, 3);
};

const getById = async (id) => {
  const { data } = await api.get(`/resume/${id}`);
  return mapAnalysis(data);
};

const deleteAnalysis = async (id) => {
  const { data } = await api.delete(`/resume/delete/${id}`);
  return data;
};

const deleteAll = async () => {
  const { data } = await api.delete("/resume");
  return data;
};

export default { analyzeResume, getHistory, getRecent, getById, deleteAnalysis, deleteAll };
