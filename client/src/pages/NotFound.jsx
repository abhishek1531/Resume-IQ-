import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Go home
      </Link>
    </div>
  );
};

export default NotFound;
