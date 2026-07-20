import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Mail, Github } from "lucide-react";
import FeedbackModal from "../components/FeedbackModal";

const Contact = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const feedbackTriggerRef = useRef(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">ResumeIQ</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft size={16} /> Back home
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight text-center">
          Contact
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-center max-w-xl mx-auto">
          Have a question, found a bug, or want to suggest a feature? Reach out
          any time.
        </p>

        <div className="card p-6 sm:p-8 mt-10 grid sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                abhi.singh15dec@gmail.com
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center shrink-0">
              <Github size={18} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">GitHub</h3>
              <a
                href="https://github.com/abhishek1531"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline break-all"
              >
                https://github.com/abhishek1531
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            ref={feedbackTriggerRef}
            onClick={() => setFeedbackOpen(true)}
            className="btn-primary"
          >
            <Mail size={16} /> Send Feedback
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 ResumeIQ. All rights reserved.
      </footer>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        triggerRef={feedbackTriggerRef}
      />
    </div>
  );
};

export default Contact;
