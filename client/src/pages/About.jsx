import { Link } from "react-router-dom";
import {
  FileText,
  ScanSearch,
  Sparkles,
  ListChecks,
  History as HistoryIcon,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const items = [
  {
    icon: ScanSearch,
    title: "AI Resume Analysis",
    description:
      "ResumeIQ reads your resume and evaluates its structure, clarity, and content against best practices.",
  },
  {
    icon: ListChecks,
    title: "ATS Score",
    description:
      "Get a rule-based compatibility score that mirrors how real Applicant Tracking Systems parse and rank resumes.",
  },
  {
    icon: Sparkles,
    title: "AI Feedback",
    description:
      "Gemini reviews your resume and highlights strengths, weaknesses, and concrete suggestions for improvement.",
  },
  {
    icon: FileText,
    title: "Job Description Matching",
    description:
      "Paste a job description and see exactly which required skills match your resume and which ones are missing.",
  },
  {
    icon: HistoryIcon,
    title: "History Tracking",
    description:
      "Every analysis is saved to your account, so you can revisit past results and track how your resume improves over time.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Your account and resume data are protected behind secure, authenticated access.",
  },
];

const About = () => {
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

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          About ResumeIQ
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          ResumeIQ is an AI-powered resume intelligence platform that helps job
          seekers understand exactly how their resume performs against real
          job descriptions and Applicant Tracking Systems.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, description }) => (
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

      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 ResumeIQ. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
