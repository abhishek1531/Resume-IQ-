import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { isValidEmail } from "../utils/validators";
import feedbackService from "../services/feedbackService";
import Toast from "./Toast";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

const FeedbackModal = ({ open, onClose, triggerRef }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const modalRef = useRef(null);
  const firstFieldRef = useRef(null);
  const closeTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Reset internal state whenever the modal is opened fresh, and focus
  // the first field for keyboard users / screen readers.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSending(false);
      setToast(null);
      if (!feedbackService.isEmailJsConfigured()) {
        console.warn(
          "[EmailJS] Feedback form opened but EmailJS is not fully configured. " +
            "Sending will fail until VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID " +
            "and VITE_EMAILJS_PUBLIC_KEY are set in your .env file."
        );
      }
      const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape to close + focus trap while the modal is open.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Clean up any pending timers on unmount.
  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (sending) return;
    clearTimeout(closeTimerRef.current);
    onClose();
    // Return focus to whatever triggered the modal.
    triggerRef?.current?.focus();
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.message.trim()) next.message = "Message is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const showToast = (type, message, autoHide = 4000) => {
    clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), autoHide);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!validate()) return;

    setSending(true);
    console.log("Sending feedback...");
    try {
      const response = await feedbackService.sendFeedback({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      console.log("Feedback sent successfully:", response);

      showToast("success", "Thank you for your feedback! Your message has been sent successfully.");
      setForm(EMPTY_FORM);
      closeTimerRef.current = setTimeout(() => {
        onClose();
        triggerRef?.current?.focus();
      }, 1800);
    } catch (error) {
      // Do not swallow the error - log everything useful for debugging.
      console.error(error);
      console.error(error?.text);
      console.error(error?.status);
      console.error(error?.message);
      showToast("error", feedbackService.getFeedbackErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Toast toast={toast} />
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-gray-900/50 dark:bg-black/60"
              onClick={handleClose}
              aria-hidden="true"
            />

            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="relative card w-full max-w-md p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-5">
                <h2
                  id="feedback-modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  Send Feedback
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close feedback form"
                  className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 transition-colors -m-1.5 p-1.5"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="feedback-name" className="label-text">
                      Name
                    </label>
                    <input
                      id="feedback-name"
                      ref={firstFieldRef}
                      type="text"
                      className="input-field"
                      value={form.name}
                      onChange={handleChange("name")}
                      aria-required="true"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "feedback-name-error" : undefined}
                      disabled={sending}
                    />
                    {errors.name && (
                      <p id="feedback-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback-email" className="label-text">
                      Email
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      className="input-field"
                      value={form.email}
                      onChange={handleChange("email")}
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "feedback-email-error" : undefined}
                      disabled={sending}
                    />
                    {errors.email && (
                      <p id="feedback-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback-subject" className="label-text">
                      Subject
                    </label>
                    <input
                      id="feedback-subject"
                      type="text"
                      className="input-field"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      aria-required="true"
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={errors.subject ? "feedback-subject-error" : undefined}
                      disabled={sending}
                    />
                    {errors.subject && (
                      <p id="feedback-subject-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback-message" className="label-text">
                      Message
                    </label>
                    <textarea
                      id="feedback-message"
                      rows={4}
                      className="input-field resize-none"
                      value={form.message}
                      onChange={handleChange("message")}
                      aria-required="true"
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "feedback-message-error" : undefined}
                      disabled={sending}
                    />
                    {errors.message && (
                      <p id="feedback-message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={sending}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={sending} className="btn-primary">
                    {sending && <Loader2 size={16} className="animate-spin" />}
                    {sending ? "Sending..." : "Send Feedback"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackModal;
