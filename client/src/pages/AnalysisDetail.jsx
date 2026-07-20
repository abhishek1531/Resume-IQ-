import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  ArrowLeft,
  Trash2,
  Download,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import ScoreRing from "../components/ScoreRing";
import SkillTag from "../components/SkillTag";
import AiEvaluatedChecklist from "../components/AiEvaluatedChecklist";
import analysisService from "../services/analysisService";
import { formatDate } from "../utils/validators";

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await analysisService.getById(id);
        setAnalysis(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this analysis");
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this analysis? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await analysisService.deleteAnalysis(id);
      navigate("/history");
    } catch (err) {
      setDeleting(false);
    }
  };

  // Exports the report as a PDF using the browser's native print-to-PDF,
  // styled by the @media print rules in index.css (hides sidebar/nav/buttons).
  const handleExportPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20">
          <LoadingSpinner text="Loading analysis..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">{error || "Analysis not found"}</p>
          <Link to="/history" className="text-primary-600 font-medium hover:underline mt-3 inline-block">
            Back to History
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const aiUnavailable = analysis.aiAvailable === false;

  return (
    <DashboardLayout>
      <div className="print-area">
        <button
          onClick={() => navigate("/history")}
          className="no-print flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft size={16} /> Back to history
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {analysis.jobTitle}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
              Analyzed on {formatDate(analysis.createdAt)} · {analysis.resume?.originalName}
            </p>
          </div>
          <div className="no-print flex items-center gap-2 shrink-0">
            <button onClick={handleExportPdf} className="btn-secondary">
              <Download size={16} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger">
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {aiUnavailable && (
          <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-400 text-sm rounded-lg p-4 mb-6">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI Feedback Unavailable</p>
              <p className="mt-0.5">
                Couldn't generate AI feedback. Your ATS score and job match were still
                calculated normally - Gemini just couldn't respond this time (quota limit,
                timeout, or a temporary API issue). Try running the analysis again later.
              </p>
            </div>
          </div>
        )}

        {/* Scores */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            <div className="flex flex-col items-center">
              <ScoreRing score={analysis.atsScore} label="ATS Score" size={128} />
            </div>
            <div className="flex flex-col items-center">
              {aiUnavailable ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="rounded-full border-4 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center"
                    style={{ width: 128, height: 128 }}
                  >
                    <AlertTriangle size={26} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Score</span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Unavailable</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-[160px] leading-snug">
                    Couldn't generate AI feedback.
                  </span>
                </div>
              ) : (
                <ScoreRing score={analysis.aiScore} label="AI Score" size={128} />
              )}
            </div>
            <div className="flex flex-col items-center">
              <ScoreRing score={analysis.jobMatch} label="Job Match" size={128} />
            </div>
          </div>
        </div>

        {/* Why this score */}
        <div className="card p-6 sm:p-7 mb-6">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Why this score?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {analysis.scoreExplanation}
          </p>
          <AiEvaluatedChecklist categoryEvaluation={analysis.categoryEvaluation} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Matched skills */}
          <div className="card p-6 sm:p-7">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Matched Skills</h3>
            {analysis.matchedSkills.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No matching skills found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills.map((skill) => (
                  <SkillTag key={skill} variant="matched">
                    {skill}
                  </SkillTag>
                ))}
              </div>
            )}
          </div>

          {/* Missing skills */}
          <div className="card p-6 sm:p-7">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Missing Skills</h3>
            {analysis.missingSkills.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Great news — no missing skills detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill) => (
                  <SkillTag key={skill} variant="missing">
                    {skill}
                  </SkillTag>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="card p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp size={18} className="text-green-600" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Strengths</h3>
            </div>
            {aiUnavailable || analysis.strengths.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {aiUnavailable ? "Unavailable" : "No strengths generated."}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {analysis.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Weaknesses */}
          <div className="card p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsDown size={18} className="text-red-600" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Weaknesses</h3>
            </div>
            {aiUnavailable || analysis.weaknesses.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {aiUnavailable ? "Unavailable" : "No weaknesses generated."}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {analysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Suggestions */}
          <div className="card p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-yellow-500" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Suggestions</h3>
            </div>
            {aiUnavailable || analysis.suggestions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {aiUnavailable ? "Unavailable" : "No suggestions generated."}
              </p>
            ) : (
              <ol className="space-y-2.5 list-decimal list-inside marker:text-gray-400 dark:marker:text-gray-500 marker:font-semibold">
                {analysis.suggestions.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalysisDetail;
