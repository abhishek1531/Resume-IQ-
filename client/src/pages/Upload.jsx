import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import ScoreRing from "../components/ScoreRing";
import resumeService from "../services/resumeService";
import analysisService from "../services/analysisService";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [removing, setRemoving] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  // Preload the user's latest resume so they don't have to re-upload
  // every time they want to analyze against a new job description.
  useEffect(() => {
    const loadLatest = async () => {
      try {
        const resume = await resumeService.getLatestResume();
        if (resume) setUploadedResume(resume);
      } catch (error) {
        // No resume yet - that's fine, user will upload one
      }
    };
    loadLatest();
  }, []);

  const handleFileSelect = (selectedFile) => {
    setUploadError("");
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      setUploadError("Only PDF files are supported");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("File size must be under 5MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    try {
      const data = await resumeService.uploadResume(file, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
      setUploadedResume(data);
      setFile(null);
    } catch (error) {
      setUploadError(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveResume = async () => {
    if (!uploadedResume) return;
    if (!window.confirm("Remove your uploaded resume? You'll need to upload a new one to run further analyses.")) return;
    setRemoving(true);
    try {
      await resumeService.deleteResume(uploadedResume._id);
      setUploadedResume(null);
    } catch (error) {
      setUploadError(error.response?.data?.message || "Failed to remove resume. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzeError("");

    if (!uploadedResume) {
      setAnalyzeError("Please upload a resume first");
      return;
    }
    if (jobDescription.trim().length < 30) {
      setAnalyzeError("Please paste a more complete job description (at least a few sentences)");
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analysisService.analyzeResume(
        uploadedResume._id,
        jobDescription,
        jobTitle
      );
      navigate(`/analysis/${analysis._id}`);
    } catch (error) {
      setAnalyzeError(error.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analyze Your Resume</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Upload your resume, paste a job description, and get your scores instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Step 1: Upload */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">1. Upload Resume (PDF)</h3>

          {uploadedResume && !file && (
            <div className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                <span className="text-sm text-green-800 dark:text-green-400 truncate">
                  {uploadedResume.originalName}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline"
                >
                  Replace
                </button>
                <button
                  onClick={handleRemoveResume}
                  disabled={removing}
                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                >
                  {removing ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          )}

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/30 transition-colors"
          >
            <UploadCloud size={28} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="text-primary-600 font-medium">Click to browse</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF only, up to 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {file && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg mt-4">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 shrink-0">
                <X size={16} />
              </button>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mt-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {file && (
            <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full mt-4">
              {uploading ? `Uploading... ${uploadProgress}%` : "Upload Resume"}
            </button>
          )}

          {uploading && (
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Step 2: Job description + analyze */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Paste Job Description</h3>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="label-text">Job title (optional)</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer Intern"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Job description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={9}
                className="input-field resize-none"
              />
            </div>

            {analyzeError && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-lg p-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{analyzeError}</span>
              </div>
            )}

            <button type="submit" disabled={analyzing} className="btn-primary w-full">
              {analyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>
        </div>
      </div>

      {uploadedResume && (
        <div className="card p-6 sm:p-7 mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">3. Results</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Paste a job description and click Analyze to calculate your scores.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={null} label="ATS Score" unavailableText="—" size={80} />
              <span className="text-xs text-gray-400 dark:text-gray-500">Not analyzed yet</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={null} label="AI Score" unavailableText="—" size={80} />
              <span className="text-xs text-gray-400 dark:text-gray-500">Not analyzed yet</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={null} label="Job Match" unavailableText="—" size={80} />
              <span className="text-xs text-gray-400 dark:text-gray-500">Not analyzed yet</span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Upload;
