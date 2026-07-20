import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, LogOut, Sun, Moon, Monitor, Trash2, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import userService from "../services/userService";
import analysisService from "../services/analysisService";
import { isStrongPassword } from "../lib/passwordValidation";
import PasswordChecklist from "../components/PasswordChecklist";

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });

  const togglePasswordVisibility = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const [deletingHistory, setDeletingHistory] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });

    if (name.trim().length < 2) {
      setProfileMsg({ type: "error", text: "Please enter a valid name" });
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile(name.trim());
      setUser((prev) => ({ ...prev, name: updated.name }));
      setProfileMsg({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      setProfileMsg({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (!passwords.current) {
      setPasswordMsg({ type: "error", text: "Please enter your current password" });
      return;
    }
    if (!isStrongPassword(passwords.next)) {
      setPasswordMsg({ type: "error", text: "New password does not meet the requirements below" });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (passwords.next === passwords.current) {
      setPasswordMsg({
        type: "error",
        text: "New password must be different from your current password.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword(passwords.current, passwords.next);
      setPasswordMsg({ type: "success", text: "Password changed successfully" });
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (error) {
      setPasswordMsg({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDeleteAllHistory = async () => {
    if (
      !window.confirm(
        "Delete ALL analysis history? This will permanently remove every past analysis and cannot be undone."
      )
    )
      return;
    setDeletingHistory(true);
    setDeleteMsg("");
    try {
      await analysisService.deleteAll();
      setDeleteMsg("All history deleted successfully.");
    } catch (error) {
      setDeleteMsg(error.response?.data?.message || "Failed to delete history.");
    } finally {
      setDeletingHistory(false);
    }
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile and account security.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Theme - shown first so it's immediately visible */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Appearance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Choose how ResumeIQ looks on this device.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={`flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-colors ${
                  theme === value
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Current: <span className="font-medium capitalize">{theme}</span> · saved automatically
          </p>
        </div>

        {/* Profile info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label-text">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" value={user?.email || ""} disabled className="input-field bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400" />
            </div>

            {profileMsg.text && (
              <div
                className={`flex items-start gap-2 text-sm rounded-lg p-3 border ${
                  profileMsg.type === "success"
                    ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label-text">Current password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  aria-label={showPasswords.current ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label-text">New password</label>
              <div className="relative">
                <input
                  type={showPasswords.next ? "text" : "password"}
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  className="input-field pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("next")}
                  aria-label={showPasswords.next ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  {showPasswords.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordChecklist password={passwords.next} />
            </div>
            <div>
              <label className="label-text">Confirm new password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="input-field pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {passwordMsg.text && (
              <div
                className={`flex items-start gap-2 text-sm rounded-lg p-3 border ${
                  passwordMsg.type === "success"
                    ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
                }`}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                savingPassword ||
                !passwords.current ||
                !isStrongPassword(passwords.next) ||
                passwords.next !== passwords.confirm
              }
              className="btn-primary"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Delete history */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Permanently remove all of your past resume analyses. Your account and uploaded
            resumes are not affected.
          </p>
          {deleteMsg && (
            <div className="flex items-start gap-2 text-sm rounded-lg p-3 border bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 mb-4">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{deleteMsg}</span>
            </div>
          )}
          <button onClick={handleDeleteAllHistory} disabled={deletingHistory} className="btn-danger">
            <Trash2 size={16} />
            {deletingHistory ? "Deleting..." : "Delete All History"}
          </button>
        </div>

        {/* Logout */}
        <div className="card p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Logout</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Sign out of your ResumeIQ account.</p>
          </div>
          <button onClick={handleLogout} className="btn-danger">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
