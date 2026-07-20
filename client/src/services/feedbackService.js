import emailjs from "@emailjs/browser";

// EmailJS credentials are provided via environment variables and must
// never be hardcoded here. See .env.example for the required keys.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Returns a list of missing env var names, e.g. ["VITE_EMAILJS_SERVICE_ID"].
const getMissingConfigKeys = () => {
  const missing = [];
  if (!SERVICE_ID) missing.push("VITE_EMAILJS_SERVICE_ID");
  if (!TEMPLATE_ID) missing.push("VITE_EMAILJS_TEMPLATE_ID");
  if (!PUBLIC_KEY) missing.push("VITE_EMAILJS_PUBLIC_KEY");
  return missing;
};

export const isEmailJsConfigured = () => getMissingConfigKeys().length === 0;

// Sends the feedback form through EmailJS.
//
// IMPORTANT: these keys must match the variable names used inside your
// EmailJS template EXACTLY (Template editor -> Content -> {{variable}}),
// and the template's "To Email" field must be set to {{email}} (or
// whatever variable you use to receive the sender's address) or EmailJS
// will reject the request / silently fail to deliver.
//
//   {{name}}    -> sender's name
//   {{email}}   -> sender's email
//   {{subject}} -> message subject
//   {{message}} -> message body
const sendFeedback = async ({ name, email, subject, message }) => {
  const missing = getMissingConfigKeys();
  if (missing.length > 0) {
    // Clear, actionable warning for developers - this is not shown to the
    // end user, it's meant to be spotted immediately in devtools.
    console.error(
      `[EmailJS] Not configured. Missing environment variable(s): ${missing.join(
        ", "
      )}. Add them to your .env file (see .env.example), restart the dev ` +
        `server, and make sure they are also set in your production build environment.`
    );
    throw new Error(
      `EmailJS is not configured. Missing: ${missing.join(", ")}.`
    );
  }

  const templateParams = { name, email, subject, message };

  console.log("[EmailJS] Sending feedback...", {
    serviceId: SERVICE_ID,
    templateId: TEMPLATE_ID,
    templateParams,
  });

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
      publicKey: PUBLIC_KEY,
    });
    console.log("[EmailJS] Send succeeded:", response);
    return response;
  } catch (error) {
    // EmailJS can reject with a plain string, an EmailJSResponseStatus
    // ({ status, text }), or a generic Error - log all of it, don't swallow.
    console.error("[EmailJS] Send failed. Full error object:", error);
    console.error("[EmailJS] error.text:", error?.text);
    console.error("[EmailJS] error.status:", error?.status);
    console.error("[EmailJS] error.message:", error?.message);
    throw error;
  }
};

// Turns whatever shape EmailJS throws into a readable string for the UI.
export const getFeedbackErrorMessage = (error) => {
  if (!error) return "Unable to send feedback. Please try again.";
  if (typeof error === "string") return error;
  if (error.text) return `${error.text}${error.status ? ` (status ${error.status})` : ""}`;
  if (error.message) return error.message;
  return "Unable to send feedback. Please try again.";
};

export default { sendFeedback, isEmailJsConfigured, getFeedbackErrorMessage };
