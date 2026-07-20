const { extractSkills, CORE_SKILLS } = require("./skillsDatabase");

const calculateATS = (resumeText) => {

    const text = resumeText.toLowerCase();

    let totalScore = 0;

    //-------------------------------------
    // Skills (30 Marks)
    //-------------------------------------
    // Previously checked a fixed list of ~17 keywords with plain substring
    // matching (e.g. "css" would also match inside "process"). Now scans
    // the shared CORE_SKILLS list with word-boundary-aware matching, for
    // much broader and more accurate keyword coverage.

    const foundSkills = extractSkills(resumeText).filter((skill) => CORE_SKILLS.includes(skill));

    const missingSkills = CORE_SKILLS.filter((skill) => !foundSkills.includes(skill));

    let skillScore = Math.min(foundSkills.length * 2, 30);

    //-------------------------------------
    // Projects (20 Marks)
    //-------------------------------------

    let projectScore=0;

    if(text.includes("project"))
        projectScore+=8;

    if(text.includes("github"))
        projectScore+=6;

    if(text.includes("developed"))
        projectScore+=6;

    if(projectScore>20)
        projectScore=20;

    //-------------------------------------
    // Education (10)
    //-------------------------------------

    let educationScore=0;

    if(text.includes("b.tech"))
        educationScore=10;

    //-------------------------------------
    // Experience (10)
    //-------------------------------------

    let experienceScore=0;

    if(text.includes("internship"))
        experienceScore+=5;

    if(text.includes("training"))
        experienceScore+=5;

    //-------------------------------------
    // Achievements (10)
    //-------------------------------------

    let achievementScore=0;

    if(text.includes("leetcode"))
        achievementScore+=5;

    if(text.includes("hackathon"))
        achievementScore+=5;

    //-------------------------------------
    // Links (5)
    //-------------------------------------

    let profileScore=0;

    if(text.includes("github.com"))
        profileScore+=2;

    if(text.includes("linkedin"))
        profileScore+=3;

    //-------------------------------------
    // Formatting (5)
    //-------------------------------------

    let formattingScore=5;

    //-------------------------------------

    totalScore=

        skillScore+
        projectScore+
        educationScore+
        experienceScore+
        achievementScore+
        profileScore+
        formattingScore;

    if(totalScore>100)
        totalScore=100;

    return{

        atsScore:totalScore,

        foundSkills,

        missingSkills,

        breakdown:{

            skillScore,

            projectScore,

            educationScore,

            experienceScore,

            achievementScore,

            profileScore,

            formattingScore

        }

    }

}

module.exports=calculateATS;