import { Check } from "lucide-react";
import { getPasswordChecklist } from "../lib/passwordValidation";

// Live password-requirements checklist shown under a password field.
// Each requirement turns green (with a subtle fade/color transition) the
// moment it's satisfied while typing.
const PasswordChecklist = ({ password }) => {
  const checklist = getPasswordChecklist(password || "");

  return (
    <ul className="mt-2 space-y-1">
      {checklist.map((item) => (
        <li
          key={item.key}
          className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
            item.passed
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <span
            className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border transition-colors duration-200 ${
              item.passed
                ? "bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <Check
              size={9}
              strokeWidth={3}
              className={`text-white transition-opacity duration-200 ${
                item.passed ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
};

export default PasswordChecklist;
