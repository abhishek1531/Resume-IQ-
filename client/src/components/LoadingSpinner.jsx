import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 24, text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
      <Loader2 size={size} className="animate-spin text-primary-600" />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
