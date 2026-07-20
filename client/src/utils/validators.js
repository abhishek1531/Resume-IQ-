export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const isValidPassword = (password) => password.length >= 6;

// Score color rule used consistently across ATS Score, AI Score, and Job
// Match wherever a score is rendered (ring, value text, list rows, etc):
//   0-39  -> red    (poor)
//   40-69 -> amber  (average)
//   70-100 -> green (good)
export const getScoreColor = (score) => {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export const getScoreBg = (score) => {
  if (score >= 70) return "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900";
  if (score >= 40) return "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900";
  return "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900";
};

export const getScoreRingColor = (score) => {
  if (score >= 70) return "#16a34a"; // green-600
  if (score >= 40) return "#f59e0b"; // amber-500
  return "#dc2626"; // red-600
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
