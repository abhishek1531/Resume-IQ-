# ResumeIQ (merged)

This project merges two prior ResumeIQ codebases:

- **`client/`** — Project A's frontend, kept as-is (UI, pages, components, styling, routing).
  Only the `src/services/*.js` files were changed, to talk to Project B's backend.
- **`server/`** — Project B's backend, kept as-is (auth, resume upload, ATS engine, job
  matcher, Gemini analysis, models, middleware). A few small, additive pieces were
  added purely to fill gaps the frontend needed to function (see below) — no existing
  business logic was rewritten or removed.

## What was changed, and why

### Frontend (`client/src/services/`)
These files were rewritten to call the real backend routes and normalize its
response shapes into what the existing pages/components already expect. No
`.jsx` file, no component, and no styling was touched.

- `api.js` — unchanged (base URL from `VITE_API_URL`, JWT header injection, 401 redirect).
- `authService.js` — points at `/auth/register` (was `/auth/signup`), and flattens the
  backend's `{ token, user: {...} }` response into the flat shape `AuthContext` expects.
  `logout()` no longer calls a (non-existent) `/auth/logout` endpoint — JWT auth is
  stateless, so logout is just clearing the local token, which `AuthContext` already does.
- `resumeService.js` — points at `/resume/history` and `/resume/delete/:id` (previously
  guessed paths), and maps backend fields (`resumeId`, `fileName`) to what the UI uses
  (`_id`, `originalName`).
- `analysisService.js` — the backend has **no separate "Analysis" collection**; a resume
  document *is* the analysis (re-analyzing overwrites its JD-match/AI fields in place).
  This service adapts that onto the "analysis object" shape the UI expects, keyed by the
  resume's id, and treats a resume as an "analysis" once it has a saved job description.
- `userService.js` — points at the new `/api/user/*` routes (see below) and unwraps their
  responses into the `{ user, stats }` / flat shapes `Profile.jsx` and `Settings.jsx` expect.

### Backend (`server/`) — small additive changes only
- **`models/Resume.js`**: added an optional `jobTitle` field (default `""`). Cosmetic only —
  no scoring/matching logic reads or depends on it.
- **`controllers/resumeController.js`**:
  - `analyzeResume` now accepts an optional `jobTitle`, and wraps the Gemini call in a
    `try/catch` so a Gemini outage/quota error no longer fails the whole request — the ATS
    score and JD match are still saved, and the response includes `aiAvailable: false` so
    the UI's existing "AI feedback unavailable" state renders correctly. The response was
    also enriched with `resumeId`, `fileName`, `jobTitle`, and `createdAt` so the frontend
    doesn't have to guess them.
  - Added `getResumeById` (`GET /api/resume/:id`) — needed by the analysis detail page;
    didn't exist before (only bulk `history` did).
  - Added `deleteAllResumes` (`DELETE /api/resume`) — needed by the "Delete All History"
    button in Settings; didn't exist before.
  - `getResumeHistory` now also selects `jobTitle`.
- **`controllers/userController.js` + `routes/userRoutes.js`** (new, mounted at `/api/user`):
  the frontend's Profile/Settings pages need a profile+stats endpoint, a "change name"
  endpoint, and a "change password" endpoint, none of which existed in Project B. These
  are built entirely on top of the existing `User`/`Resume` models and the existing
  `passwordPolicy` validator — no new business logic was invented, just wired up.
- **`server.js`**: mounts the new `userRoutes` at `/api/user`.
- Removed `server/utils/atsScore.js` — an unused, near-duplicate of `atsEngine.js` that
  nothing imported (dead code / duplicate removal).
- Removed the real `server/.env` (contained a live Gemini API key) and the sample PDF
  files that were sitting in `server/uploads/` from prior local testing — only
  `.env.example` ships. **You must create your own `server/.env`.**

### Backend analysis logic fixes (round 2)
- **`services/geminiService.js`**: the Gemini prompt now asks for `scoreOutOf100`
  (0–100) instead of `scoreOutOf10`. The response is also defensively normalized and
  clamped to `0–100` server-side, so the frontend's `ScoreRing` gauge — which always
  renders on a 0–100 scale — never receives an off-scale value.
- **`utils/skillsDatabase.js`** (new): a shared database of ~100 skills (each with a
  canonical display name and every common alias/spelling), covering web, backend,
  cloud/DevOps, data/AI, mobile, and game development (Unity, Unreal Engine, C#, C++,
  Game Design, Animation, Physics, Rendering, OpenGL, DirectX, Blender, AR, VR,
  Multiplayer, AI, and more). Matching uses word-boundary-aware regex (not plain
  substring checks), so e.g. "css" no longer matches inside "process", and "C" no
  longer matches inside "C#"/"C++"/"Node.js".
- **`utils/jobMatcher.js`**: rewritten to dynamically extract required skills from
  *the actual job description* (via the shared database) instead of a small
  ~30-item fixed array. Matched/missing skills and the job-match percentage are all
  computed from that dynamically-extracted requirement list, so missing skills now
  reflect what's genuinely absent — not a generic hardcoded set.
- **`utils/atsEngine.js`**: the "Skills (30 marks)" section now scans a much broader
  curated core-skill list (~40 cross-domain skills, via the same shared database)
  instead of the original 17-keyword list, with the same word-boundary-aware matching
  for accuracy. The rest of the scoring (projects/education/experience/achievements/
  links/formatting) is unchanged.

Everything else in `server/` — `authController`, `authMiddleware`, `upload`
middleware, `extractText`, `generateToken`, `passwordPolicy`, the `User`/`Resume`
models, and all existing routes — is untouched.

## Running it

```bash
# 1. Backend
cd server
cp .env.example .env      # then fill in JWT_SECRET, GEMINI_API_KEY, MONGO_URI
npm install
npm run dev                # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api (already default)
npm install
npm run dev                 # http://localhost:5173
```

MongoDB must be running locally (or `MONGO_URI` pointed at Atlas/another instance).
`GEMINI_API_KEY` is only required for the AI-feedback portion of analysis — without it,
uploads/ATS/job-matching still work, and analysis gracefully falls back to
`aiAvailable: false`.

## Feature checklist

| Feature | Status |
|---|---|
| Signup / Login | Backend `/api/auth/register`, `/api/auth/login`, `/api/auth/me` (JWT) |
| Upload Resume | `/api/resume/upload` (multer, PDF only, 10MB limit) |
| Resume Analysis | `/api/resume/analyze` (ATS + job matcher + Gemini, graceful AI fallback) |
| ATS Score | from `atsEngine.js`, unchanged |
| AI Score | from Gemini, degrades gracefully to "unavailable" on failure |
| Job Match | from `jobMatcher.js`, unchanged |
| Strengths / Weaknesses / Suggestions | from Gemini response |
| History | `/api/resume/history`, filterable/sortable client-side |
| Delete Analysis / Delete All | `/api/resume/delete/:id`, `/api/resume` (bulk) |
| Profile / Settings | new `/api/user/profile`, `/api/user/change-password` |
| Export PDF | unchanged — uses the browser's print-to-PDF (`window.print()`), no backend involved |
