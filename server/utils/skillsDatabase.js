// Shared skills database + matching helpers.
//
// Both the ATS engine (utils/atsEngine.js) and the job-description matcher
// (utils/jobMatcher.js) used to keep their own small, hardcoded keyword
// lists. That meant limited coverage and duplicated logic. This file is
// the single place skills get added going forward.
//
// Each entry has a canonical `display` name (what the frontend shows) and
// a list of `aliases` - every common way that skill actually shows up in
// resumes/job descriptions (abbreviations, punctuation variants, etc).

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Matches `alias` as a whole token even when it starts or ends with a
// non-alphanumeric character (e.g. "C++", "C#", "Node.js", "CI/CD",
// ".NET") - a plain `\b` boundary doesn't work well for those. Also
// excludes "+", "#", and "." from the boundary itself, so a short/generic
// alias like "C" or "js" doesn't false-match inside "C++"/"C#" or inside
// a dotted token like "Node.js" (which would otherwise wrongly count as
// a JavaScript match via the "js" alias).
const buildAliasRegex = (alias) =>
  new RegExp(`(?<![a-zA-Z0-9+#.])${escapeRegex(alias)}(?![a-zA-Z0-9+#.])`, "i");

const SKILLS = [
  // --- Languages ---
  { display: "JavaScript", aliases: ["javascript", "js"] },
  { display: "TypeScript", aliases: ["typescript", "ts"] },
  { display: "Python", aliases: ["python"] },
  { display: "Java", aliases: ["java"] },
  { display: "C++", aliases: ["c++", "cpp"] },
  { display: "C#", aliases: ["c#", "csharp", "c sharp"] },
  { display: "C", aliases: ["c"] },
  { display: "Go", aliases: ["golang", "go"] },
  { display: "Rust", aliases: ["rust"] },
  { display: "PHP", aliases: ["php"] },
  { display: "Ruby", aliases: ["ruby"] },
  { display: "Swift", aliases: ["swift"] },
  { display: "Kotlin", aliases: ["kotlin"] },
  { display: "MATLAB", aliases: ["matlab"] },

  // --- Web / Frontend ---
  { display: "HTML", aliases: ["html", "html5"] },
  { display: "CSS", aliases: ["css", "css3"] },
  { display: "React", aliases: ["react", "react.js", "reactjs"] },
  { display: "React Native", aliases: ["react native", "reactnative"] },
  { display: "Angular", aliases: ["angular", "angularjs"] },
  { display: "Vue", aliases: ["vue", "vue.js", "vuejs"] },
  { display: "Next.js", aliases: ["next.js", "nextjs"] },
  { display: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"] },
  { display: "Bootstrap", aliases: ["bootstrap"] },
  { display: "Sass", aliases: ["sass", "scss"] },
  { display: "Webpack", aliases: ["webpack"] },
  { display: "Vite", aliases: ["vite"] },
  { display: "Three.js", aliases: ["three.js", "threejs"] },
  { display: "WebGL", aliases: ["webgl"] },

  // --- Backend ---
  { display: "Node.js", aliases: ["node.js", "nodejs", "node"] },
  { display: "Express", aliases: ["express", "express.js", "expressjs"] },
  { display: "Django", aliases: ["django"] },
  { display: "Flask", aliases: ["flask"] },
  { display: "Spring Boot", aliases: ["spring boot", "springboot", "spring"] },
  { display: "Hibernate", aliases: ["hibernate"] },
  { display: ".NET", aliases: [".net", "dotnet", "asp.net"] },
  { display: "GraphQL", aliases: ["graphql"] },
  { display: "REST API", aliases: ["rest api", "restful api", "rest"] },
  { display: "Microservices", aliases: ["microservices"] },
  { display: "gRPC", aliases: ["grpc"] },
  { display: "WebSockets", aliases: ["websocket", "websockets", "socket.io"] },

  // --- Databases ---
  { display: "MongoDB", aliases: ["mongodb", "mongo"] },
  { display: "MySQL", aliases: ["mysql"] },
  { display: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { display: "SQL", aliases: ["sql"] },
  { display: "NoSQL", aliases: ["nosql"] },
  { display: "Redis", aliases: ["redis"] },
  { display: "Firebase", aliases: ["firebase"] },
  { display: "SQLite", aliases: ["sqlite"] },

  // --- Cloud / DevOps ---
  { display: "AWS", aliases: ["aws", "amazon web services"] },
  { display: "Azure", aliases: ["azure"] },
  { display: "Google Cloud", aliases: ["gcp", "google cloud"] },
  { display: "Docker", aliases: ["docker"] },
  { display: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { display: "CI/CD", aliases: ["ci/cd", "ci-cd", "continuous integration"] },
  { display: "Jenkins", aliases: ["jenkins"] },
  { display: "Terraform", aliases: ["terraform"] },
  { display: "Linux", aliases: ["linux"] },
  { display: "Bash", aliases: ["bash", "shell scripting"] },
  { display: "Nginx", aliases: ["nginx"] },

  // --- Tools / Practices ---
  { display: "Git", aliases: ["git"] },
  { display: "GitHub", aliases: ["github"] },
  { display: "GitLab", aliases: ["gitlab"] },
  { display: "JWT", aliases: ["jwt"] },
  { display: "OAuth", aliases: ["oauth"] },
  { display: "Agile", aliases: ["agile"] },
  { display: "Scrum", aliases: ["scrum"] },
  { display: "Jira", aliases: ["jira"] },
  { display: "Figma", aliases: ["figma"] },
  { display: "Jest", aliases: ["jest"] },
  { display: "Cypress", aliases: ["cypress"] },
  { display: "Selenium", aliases: ["selenium"] },
  { display: "Unit Testing", aliases: ["unit testing", "unit tests"] },
  { display: "Data Structures & Algorithms", aliases: ["dsa", "data structures", "algorithms"] },
  { display: "OOP", aliases: ["oop", "oops", "object oriented"] },

  // --- Data / AI / ML ---
  { display: "Machine Learning", aliases: ["machine learning", "ml"] },
  { display: "Deep Learning", aliases: ["deep learning"] },
  { display: "AI", aliases: ["artificial intelligence", "ai"] },
  { display: "Computer Vision", aliases: ["computer vision", "opencv"] },
  { display: "NLP", aliases: ["nlp", "natural language processing"] },
  { display: "TensorFlow", aliases: ["tensorflow"] },
  { display: "PyTorch", aliases: ["pytorch"] },
  { display: "Pandas", aliases: ["pandas"] },
  { display: "NumPy", aliases: ["numpy"] },
  { display: "Data Science", aliases: ["data science"] },

  // --- Game development ---
  { display: "Unity", aliases: ["unity", "unity3d", "unity 3d"] },
  { display: "Unreal Engine", aliases: ["unreal engine", "unreal", "ue4", "ue5"] },
  { display: "Game Development", aliases: ["game development", "game dev"] },
  { display: "Game Design", aliases: ["game design"] },
  { display: "Animation", aliases: ["animation"] },
  { display: "Physics", aliases: ["physics", "game physics", "physics engine"] },
  { display: "Rendering", aliases: ["rendering", "3d rendering", "render pipeline"] },
  { display: "OpenGL", aliases: ["opengl"] },
  { display: "DirectX", aliases: ["directx"] },
  { display: "Vulkan", aliases: ["vulkan"] },
  { display: "Shader Programming", aliases: ["shader", "shaders", "hlsl", "glsl"] },
  { display: "Blender", aliases: ["blender"] },
  { display: "Maya", aliases: ["autodesk maya", "maya"] },
  { display: "3ds Max", aliases: ["3ds max", "3dsmax"] },
  { display: "AR", aliases: ["ar", "augmented reality"] },
  { display: "VR", aliases: ["vr", "virtual reality"] },
  { display: "XR", aliases: ["xr", "mixed reality"] },
  { display: "Multiplayer Networking", aliases: ["multiplayer", "netcode", "photon", "mirror networking"] },
  { display: "Level Design", aliases: ["level design"] },
  { display: "Procedural Generation", aliases: ["procedural generation"] },
  { display: "Rigging", aliases: ["rigging"] },
  { display: "VFX", aliases: ["vfx", "visual effects"] },
  { display: "Motion Capture", aliases: ["motion capture", "mocap"] },

  // --- Mobile ---
  { display: "Android", aliases: ["android"] },
  { display: "iOS", aliases: ["ios"] },
  { display: "Flutter", aliases: ["flutter"] },

  // --- Misc ---
  { display: "Blockchain", aliases: ["blockchain", "solidity"] },
];

// A broad, cross-domain subset of SKILLS used by the ATS engine's generic
// keyword scan. Deliberately narrower than the full SKILLS list above so a
// resume isn't marked as "missing" a long tail of highly specialized
// skills (e.g. Unreal Engine, Rigging) that only matter for niche roles -
// that kind of role-specific gap is exactly what job-description matching
// (jobMatcher.js) is for.
const CORE_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#",
  "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express",
  "Django", "Flask", "Spring Boot", "REST API", "GraphQL", "Microservices",
  "MongoDB", "MySQL", "PostgreSQL", "SQL", "NoSQL", "Redis",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Linux",
  "Git", "GitHub", "JWT", "OAuth", "Agile",
  "Data Structures & Algorithms", "OOP",
  "Machine Learning", "Data Science",
];

// Returns the canonical display-name list of every skill in `skillSet`
// (defaults to the full SKILLS database) that appears anywhere in `text`,
// matched via any of that skill's aliases.
function extractSkills(text, skillSet = SKILLS) {
  if (!text) return [];
  const found = [];
  skillSet.forEach(({ display, aliases }) => {
    const present = aliases.some((alias) => buildAliasRegex(alias).test(text));
    if (present) found.push(display);
  });
  return found;
}

module.exports = { SKILLS, CORE_SKILLS, extractSkills, buildAliasRegex, escapeRegex };
