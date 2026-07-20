import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

const points = [
  "Resume files are analyzed only for the purpose of providing feedback and scoring.",
  "User data remains associated with their account and is not made public.",
  "Authentication is secured, protecting access to your account and history.",
  "ResumeIQ does not intentionally share user information with third parties.",
  "Users can delete their analysis history whenever they want.",
];

const Privacy = () => {
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
          Privacy Policy
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-center max-w-xl mx-auto">
          Your privacy matters to us. Here's a concise summary of how ResumeIQ
          handles your data.
        </p>

        <div className="card p-6 sm:p-8 mt-10">
          <ul className="space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 ResumeIQ. All rights reserved.
      </footer>
    </div>
  );
};

export default Privacy;
