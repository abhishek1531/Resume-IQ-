import api from "./api";

// Backend stores uploaded files as "<timestamp>-<originalname>" (see
// server/middleware/upload.js). Strip that prefix back off so the UI can
// show the name the user actually uploaded.
const stripTimestampPrefix = (fileName = "") => fileName.replace(/^\d+-/, "");

const mapResumeSummary = (r) => ({
  _id: r._id,
  originalName: stripTimestampPrefix(r.fileName),
  fileName: r.fileName,
  atsScore: r.atsScore,
  aiScore: r.aiScore,
  matchPercentage: r.matchPercentage,
  matchedSkills: r.matchedSkills,
  missingSkills: r.missingSkills,
  jobTitle: r.jobTitle,
  jobDescription: r.jobDescription,
  createdAt: r.createdAt,
});

const uploadResume = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("resume", file);

  // Backend response is { resumeId, atsScore, breakdown, foundSkills,
  // missingSkills } - normalize to the { _id, originalName, ... } shape
  // the Upload page expects.
  const { data } = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

  return {
    _id: data.resumeId,
    originalName: file.name,
    atsScore: data.atsScore,
    breakdown: data.breakdown,
    foundSkills: data.foundSkills,
    missingSkills: data.missingSkills,
  };
};

const getResumes = async () => {
  const { data } = await api.get("/resume/history");
  return (data.resumes || []).map(mapResumeSummary);
};

const getLatestResume = async () => {
  // No dedicated "/resume/latest" route on the backend - history is
  // already sorted newest-first, so just take the first entry.
  const resumes = await getResumes();
  return resumes.length ? resumes[0] : null;
};

const deleteResume = async (id) => {
  const { data } = await api.delete(`/resume/delete/${id}`);
  return data;
};

export default { uploadResume, getResumes, getLatestResume, deleteResume };
