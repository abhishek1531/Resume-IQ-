// Fixed categories the "AI evaluated" checklist is built from. Mirrors
// server/services/geminiService.js CHECKLIST_CATEGORIES - keep both in
// sync. Used as the standard/fallback list whenever the AI didn't return
// (or couldn't return) a detailed rating for a given category.
export const AI_CHECKLIST_CATEGORIES = [
  { key: "resumeClarity", label: "Resume clarity" },
  { key: "relevanceToJD", label: "Relevance to Job Description" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "projectsExperience", label: "Projects & Experience" },
  { key: "achievementsImpact", label: "Impact of Achievements" },
  { key: "structureReadability", label: "Resume Structure & Readability" },
  { key: "overallProfile", label: "Overall Professional Profile" },
];

const VALID_STATUSES = ["Strong", "Good", "Needs improvement"];

// Merges the fixed category list with whatever per-category ratings the
// AI actually returned for this analysis. Any category the AI didn't
// rate (or when there's no evaluation data at all - e.g. AI was
// unavailable for this run) simply falls back to a plain checklist item
// with no status caption.
export const buildAiChecklist = (categoryEvaluation) => {
  const evaluation = categoryEvaluation && typeof categoryEvaluation === "object" ? categoryEvaluation : {};

  return AI_CHECKLIST_CATEGORIES.map(({ key, label }) => {
    const status = evaluation[key];
    return {
      key,
      label,
      status: typeof status === "string" && VALID_STATUSES.includes(status) ? status : null,
    };
  });
};
