import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ScanSearch, Sparkles, ListChecks, ArrowRight, Sun, Moon, Monitor, Mail, Github } from "lucide-react";
import useTheme from "../hooks/useTheme";
import FeedbackModal from "../components/FeedbackModal";

const THEME_CYCLE = ["light", "dark", "system"];
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };

const features = [
  {
    icon: ScanSearch,
    title: "ATS Compatibility Score",
    description:
      "Get a rule-based score that mirrors how real Applicant Tracking Systems scan resumes for keywords and structure.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Feedback",
    description:
      "Gemini reviews your resume against the job description and highlights strengths, weaknesses, and suggestions.",
  },
  {
    icon: ListChecks,
    title: "Job Match Breakdown",
    description:
      "See exactly which skills from the job description are matched and which ones are missing from your resume.",
  },
];

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
  };
  const ThemeIcon = THEME_ICON[theme] || Monitor;

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const feedbackTriggerRef = useRef(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">ResumeIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cycleTheme}
              title={`Theme: ${theme} (click to change)`}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ThemeIcon size={18} />
            </button>
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary text-sm py-2">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 text-xs font-medium mb-5">
          AI-Powered Resume Intelligence
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Know exactly how your resume performs
        </h1>
        <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload your resume, paste a job description, and get an instant ATS
          score, AI-driven feedback, and a skill-match breakdown — all in one
          place.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary">
            Analyze your resume <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary">
            I already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center mb-4">
                <Icon size={20} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="card p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Have feedback or suggestions?
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            We'd love to hear from you. Share ideas, report bugs, or suggest new
            features to help improve ResumeIQ.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              ref={feedbackTriggerRef}
              onClick={() => setFeedbackOpen(true)}
              className="btn-primary"
            >
              <Mail size={16} /> Send Feedback
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 ResumeIQ. All rights reserved.
          </p>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Privacy
            </Link>
            <a
              href="https://github.com/abhishek1531"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <Github size={14} /> GitHub
            </a>
          </nav>
        </div>
      </footer>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        triggerRef={feedbackTriggerRef}
      />
    </div>
  );
};

export default Landing;
