import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

// Small, self-contained toast used for transient success/error messages.
// Rendered fixed to the viewport so it works the same whether it's
// triggered from inside a modal or from the page itself.
const Toast = ({ toast }) => {
  const isSuccess = toast?.type === "success";

  return (
    <div
      className="fixed top-4 inset-x-0 z-[70] flex justify-center px-4 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 max-w-sm w-full rounded-xl border shadow-lg px-4 py-3 ${
              isSuccess
                ? "bg-white border-green-200 dark:bg-gray-900 dark:border-green-900"
                : "bg-white border-red-200 dark:bg-gray-900 dark:border-red-900"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
