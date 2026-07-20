const SkillTag = ({ children, variant = "matched" }) => {
  const styles =
    variant === "matched"
      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900"
      : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
      {children}
    </span>
  );
};

export default SkillTag;
