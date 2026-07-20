// Mirrors server/utils/passwordPolicy.js. Keep both in sync.
// Used for live client-side validation (the checklist under password
// fields); the backend re-validates independently and is the source of
// truth - this only improves the UX so users see problems immediately.

export const PASSWORD_RULES = [
  { key: "length", label: "Minimum 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "number", label: "One number", test: (v) => /[0-9]/.test(v) },
  { key: "special", label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Returns the rule list annotated with pass/fail for the given password -
// what the live checklist renders.
export const getPasswordChecklist = (password = "") =>
  PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(password),
  }));

// True only once every rule passes.
export const isStrongPassword = (password = "") =>
  PASSWORD_RULES.every((rule) => rule.test(password));
