import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, FileCheck2, TrendingUp, Target, Plus } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import AnalysisListItem from "../components/AnalysisListItem";
import LoadingSpinner from "../components/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import userService from "../services/userService";
import analysisService from "../services/analysisService";
import resumeService from "../services/resumeService";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, recentData, resumeData] = await Promise.all([
          userService.getProfileStats(),
          analysisService.getRecent(),
          resumeService.getLatestResume(),
        ]);
        setStats(profileData.stats);
        setRecent(recentData);
        setLatestResume(resumeData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20">
          <LoadingSpinner text="Loading your dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your resume performance.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={FileCheck2} label="Total Analyses" value={stats.totalAnalyses} />
        <StatCard
          icon={TrendingUp}
          label="Average ATS Score"
          value={stats.totalAnalyses === 0 ? "—" : stats.averageATSScore}
          iconBg="bg-green-50 dark:bg-green-950/40"
          iconColor="text-green-600"
        />
        <StatCard
          icon={Target}
          label="Highest ATS Score"
          value={stats.totalAnalyses === 0 ? "—" : stats.highestATSScore}
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload / analyze CTA */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="w-11 h-11 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center mb-4">
              <UploadCloud size={20} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {latestResume ? "Analyze against a new job" : "Upload your resume"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {latestResume
                ? `Using "${latestResume.originalName}". Paste a job description to get scored.`
                : "Upload a PDF resume to get started with your first analysis."}
            </p>
            <Link to="/upload" className="btn-primary w-full">
              <Plus size={16} />
              {latestResume ? "New Analysis" : "Upload Resume"}
            </Link>
          </div>
        </div>

        {/* Recent analyses */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Analysis</h3>
              <Link to="/history" className="text-sm text-primary-600 font-medium hover:underline">
                View all
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No analyses yet. Upload a resume and analyze it against a job description to see
                  results here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((analysis) => (
                  <AnalysisListItem key={analysis._id} analysis={analysis} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
