const { SKILLS, extractSkills, buildAliasRegex } = require("./skillsDatabase");

// Dynamically figures out what a job description actually requires (by
// scanning it against the full shared skills database - covering web,
// backend, cloud, data/AI, and game-dev technologies like Unity, Unreal
// Engine, OpenGL, VR/AR, etc.) instead of checking a small fixed list.
// Whatever it finds in the JD becomes the "required skills" for that
// specific analysis, so the match score, matched skills, and missing
// skills all reflect the actual job posting rather than a generic list.
const matchResumeWithJD = (resumeText, jobDescription) => {
  const requiredSkills = extractSkills(jobDescription);

  // Skills required by the JD that also show up in the resume - used for
  // the job-match percentage and for figuring out what's missing.
  const jdMatchedSkills = requiredSkills.filter((skill) => {
    const entry = SKILLS.find((s) => s.display === skill);
    return entry.aliases.some((alias) => buildAliasRegex(alias).test(resumeText));
  });

  const missingSkills = requiredSkills.filter((skill) => !jdMatchedSkills.includes(skill));

  const percentage =
    requiredSkills.length === 0
      ? 0
      : Math.round((jdMatchedSkills.length / requiredSkills.length) * 100);

  // Every technical skill the resume itself contains, regardless of
  // whether the JD asked for it - this is what "Matched Skills" on the
  // report is meant to show (the resume's detected skill set), not just
  // the narrow overlap with a possibly skill-light JD.
  const matchedSkills = extractSkills(resumeText);

  return {
    percentage,
    matchedSkills,
    missingSkills,
  };
};

module.exports = matchResumeWithJD;
