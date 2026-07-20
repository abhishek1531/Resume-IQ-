import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Trash2, ChevronRight, ChevronLeft, ArrowUpDown } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import analysisService from "../services/analysisService";
import { formatDate, getScoreColor } from "../utils/validators";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "ats-high", label: "Highest ATS score" },
  { value: "ats-low", label: "Lowest ATS score" },
];

const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadHistory = async (searchTerm = "") => {
    setLoading(true);
    try {
      const data = await analysisService.getHistory(searchTerm);
      setAnalyses(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      loadHistory(search);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sortedAnalyses = useMemo(() => {
    const list = [...analyses];
    switch (sortBy) {
      case "oldest":
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "ats-high":
        return list.sort((a, b) => b.atsScore - a.atsScore);
      case "ats-low":
        return list.sort((a, b) => a.atsScore - b.atsScore);
      case "newest":
      default:
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [analyses, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedAnalyses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedAnalyses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this analysis? This cannot be undone.")) return;
    try {
      await analysisService.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Every resume analysis you've run, in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title..."
            className="input-field pl-9"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <ArrowUpDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="input-field pl-9 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Loading history..." />
        </div>
      ) : sortedAnalyses.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {search ? "No analyses match your search." : "No analyses yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {pageItems.map((analysis) => (
              <div
                key={analysis._id}
                onClick={() => navigate(`/analysis/${analysis._id}`)}
                className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{analysis.jobTitle}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(analysis.createdAt)} · {analysis.resume?.originalName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className={`font-semibold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">ATS</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className={`font-semibold ${getScoreColor(analysis.jobMatch)}`}>
                      {analysis.jobMatch}%
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Match</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, analysis._id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                  <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages} · {sortedAnalyses.length} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary px-3 py-1.5"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary px-3 py-1.5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default History;
