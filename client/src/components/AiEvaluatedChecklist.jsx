import { CheckCircle2 } from "lucide-react";
import { buildAiChecklist } from "../lib/aiChecklist";

// Status caption color - kept in the same red/amber/green language as the
// score rings elsewhere in the report.
const statusColor = (status) => {
  if (status === "Strong") return "text-green-600 dark:text-green-400";
  if (status === "Good") return "text-primary-600 dark:text-primary-400";
  if (status === "Needs improvement") return "text-amber-600 dark:text-amber-400";
  return "";
};

// Dynamic "AI evaluated" checklist shown right after the "Why this
// score?" paragraph. Renders a per-category status when the AI returned
// one for this analysis, and a plain checkmark item otherwise - so it
// gracefully degrades to the standard checklist when detailed evaluation
// isn't available.
const AiEvaluatedChecklist = ({ categoryEvaluation }) => {
  const checklist = buildAiChecklist(categoryEvaluation);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">AI evaluated:</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {checklist.map((item, i) => (
          <li
            key={item.key}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
            <span>
              {item.label}
              {item.status && (
                <span className={`block text-xs font-medium ${statusColor(item.status)}`}>
                  {item.status}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AiEvaluatedChecklist;
