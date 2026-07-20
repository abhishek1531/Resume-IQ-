// Mirrors client/src/lib/passwordValidation.js. Keep both in sync.
const RULES = [
  { label: "at least 8 characters", test: (v) => v.length >= 8 },
  { label: "one uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "one lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "one number", test: (v) => /[0-9]/.test(v) },
  { label: "one special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Joins rule labels into "a, b, c and d" so the message reads naturally.
function joinLabels(labels) {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function validatePassword(password) {
  if (!password) return { valid: false, message: "Password is required" };
  const failed = RULES.filter((rule) => !rule.test(password));
  if (failed.length > 0) {
    return {
      valid: false,
      message: `Password must contain ${joinLabels(RULES.map((r) => r.label))}.`,
    };
  }
  return { valid: true, message: "" };
}

module.exports = { validatePassword };
