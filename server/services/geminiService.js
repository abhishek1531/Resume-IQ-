const { GoogleGenAI } = require("@google/genai");

// Fixed set of categories the "AI evaluated" checklist on the report is
// built from. Keys match what we ask Gemini for; labels are what actually
// get displayed if the frontend ever needs a server-side fallback.
const CHECKLIST_CATEGORIES = [
  { key: "resumeClarity", label: "Resume clarity" },
  { key: "relevanceToJD", label: "Relevance to Job Description" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "projectsExperience", label: "Projects & Experience" },
  { key: "achievementsImpact", label: "Impact of Achievements" },
  { key: "structureReadability", label: "Resume Structure & Readability" },
  { key: "overallProfile", label: "Overall Professional Profile" },
];

const VALID_STATUSES = ["Strong", "Good", "Needs improvement"];

const analyzeWithGemini = async (resumeText, jobDescription) => {

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an ATS Resume Analyzer.

Resume

${resumeText}

Job Description

${jobDescription}

Return ONLY valid JSON.

{
 "scoreOutOf100":0,
 "strengths":[],
 "weaknesses":[],
 "suggestions":[],
 "categoryEvaluation":{
   "resumeClarity":"Strong",
   "relevanceToJD":"Strong",
   "technicalSkills":"Strong",
   "projectsExperience":"Strong",
   "achievementsImpact":"Strong",
   "structureReadability":"Strong",
   "overallProfile":"Strong"
 }
}

Rules:
- "scoreOutOf100" must be an integer between 0 and 100 (NOT a 0-10 scale) representing how well the resume matches the job description.
- "strengths", "weaknesses", and "suggestions" must each be an array of short strings.
- "categoryEvaluation" must rate each of the 7 listed categories as exactly one of "Strong", "Good", or "Needs improvement", based on how the resume actually performs in that area.
- Return nothing except that JSON object - no markdown, no commentary.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    let text = response.text;

    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "");
    text = text.trim();

    const parsed = JSON.parse(text);

    // Defensive normalization: if the model ever omits scoreOutOf100 (or an
    // older prompt/response shape slips through with scoreOutOf10 instead),
    // fall back cleanly rather than sending the frontend gauge - which
    // always expects a 0-100 value - something off-scale.
    let score = parsed.scoreOutOf100;

    if (typeof score !== "number" || Number.isNaN(score)) {
        score = typeof parsed.scoreOutOf10 === "number" ? parsed.scoreOutOf10 * 10 : 0;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    // Only keep entries that are one of the known categories with a
    // recognized status - anything else (missing, malformed, extra keys)
    // is dropped so the frontend can cleanly fall back to the standard
    // checklist for just that item instead of breaking the whole list.
    const rawEvaluation =
        parsed.categoryEvaluation && typeof parsed.categoryEvaluation === "object"
            ? parsed.categoryEvaluation
            : {};

    const categoryEvaluation = {};
    CHECKLIST_CATEGORIES.forEach(({ key }) => {
        const value = rawEvaluation[key];
        if (typeof value === "string" && VALID_STATUSES.includes(value.trim())) {
            categoryEvaluation[key] = value.trim();
        }
    });

    return {
        scoreOutOf100: score,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        categoryEvaluation,
    };

}

module.exports = analyzeWithGemini;
