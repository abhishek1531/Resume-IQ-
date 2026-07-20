import { useNavigate } from "react-router-dom";
import { FileText, ChevronRight } from "lucide-react";
import { formatDate, getScoreColor } from "../utils/validators";

const AnalysisListItem = ({ analysis }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/analysis/${analysis._id}`)}
      className="w-full flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary-950/30 transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
          <FileText size={18} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{analysis.jobTitle}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(analysis.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className={`font-semibold ${getScoreColor(analysis.atsScore)}`}>
            {analysis.atsScore}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">ATS</p>
        </div>
        <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
      </div>
    </button>
  );
};

export default AnalysisListItem;
