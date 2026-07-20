import { useEffect, useState } from "react";
import { Mail, FileCheck2, TrendingUp, Target, CalendarDays } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import userService from "../services/userService";
import { formatDate } from "../utils/validators";

const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await userService.getProfileStats();
        setData(result);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20">
          <LoadingSpinner text="Loading profile..." />
        </div>
      </DashboardLayout>
    );
  }

  const initials = data.user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your account and analysis summary.</p>
      </div>

      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 flex items-center justify-center text-xl font-semibold shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.user.name}</h2>
          <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            <Mail size={14} /> {data.user.email}
          </p>
          {data.user.createdAt && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <CalendarDays size={14} /> Joined {formatDate(data.user.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={FileCheck2} label="Total Analyses" value={data.stats.totalAnalyses} />
        <StatCard
          icon={TrendingUp}
          label="Average ATS Score"
          value={data.stats.totalAnalyses === 0 ? "—" : data.stats.averageATSScore}
          iconBg="bg-green-50 dark:bg-green-950/40"
          iconColor="text-green-600"
        />
        <StatCard
          icon={Target}
          label="Highest ATS Score"
          value={data.stats.totalAnalyses === 0 ? "—" : data.stats.highestATSScore}
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600"
        />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
