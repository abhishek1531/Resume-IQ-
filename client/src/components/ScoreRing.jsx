import { getScoreRingColor } from "../utils/validators";

// A simple SVG ring that visually represents a 0-100 score.
// Kept dependency-free (no charting library) since it's just one shape.
// score can be:
//   - a number (0-100): renders the filled ring as normal
//   - null / undefined: renders an empty ring with "N/A", used when
//     the score hasn't been calculated yet, or Gemini was unavailable.
const ScoreRing = ({ score, label, size = 96, unavailableText = "N/A" }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const hasScore = typeof score === "number" && !Number.isNaN(score);
  const progress = hasScore ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circumference - (progress / 100) * circumference;
  const color = hasScore ? getScoreRingColor(progress) : "#9ca3af"; // gray-400

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth={strokeWidth}
          />
          {hasScore && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {hasScore ? (
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(progress)}
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {unavailableText}
            </span>
          )}
        </div>
      </div>
      {label && <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>}
    </div>
  );
};

export default ScoreRing;
