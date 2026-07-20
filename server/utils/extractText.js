const fs = require("fs");
const pdf = require("pdf-parse");

const extractText = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdf(dataBuffer);

    return data.text.trim();
  } catch (error) {
    console.error("PDF Parse Error:", error);
    return "";
  }
};

module.exports = extractText;