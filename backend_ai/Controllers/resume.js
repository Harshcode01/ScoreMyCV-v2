const ResumeModel = require("../Models/resume");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

exports.addResume = async (req, res) => {
  try {
    const { job_desc, user } = req.body;
    const pdfPath = req.file.path;

    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `Evaluate the resume against the job description.

Resume:
${pdfData.text}

Job description:
${job_desc}

Instructions:
1. Provide a score from 0 to 100.
2. Write a reason based on the score:
   - Low match: state key missing qualifications.
   - Medium match: state specific areas to improve.
   - High match: state extra skills to stand out.
3. Write exactly 2 complete sentences between 40 and 50 words total so the text finishes before the cutoff.

Format:
Score: XX
Reason: ...`;

    const response = await cohere.chat({
      model: "command-r-08-2024",
      message: prompt,
      maxTokens: 100,
      temperature: 0.7,
    });

    let result = response.text;

    // Score
    const match = result.match(/Score:\s*(\d+)/);
    const score = match ? parseInt(match[1], 10) : null;

    // Feedback
    const reasonMatch = result.match(/Reason:\s*([\s\S]*)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : null;

    const newResume = new ResumeModel({
      user,
      resume_name: req.file.originalname,
      job_desc,
      score,
      feedback: reason,
    });

    await newResume.save();
    fs.unlinkSync(pdfPath);

    res.status(200).json({ message: "your analysis are ready", data: newResume });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error", message: err.message });
  }
};

exports.getAllResumesForUser = async (req, res) => {
  try {
    const { user } = req.params;
    let resumes = await ResumeModel.find({ user: user }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Your previous history", resumes: resumes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error", message: err.message });
  }
};

exports.getAllResumesForAdmin = async (req, res) => {
  try {
    let resumes = await ResumeModel.find({}).sort({ createdAt: -1 }).populate("user");
    return res.status(200).json({ message: "fetch all History", resumes: resumes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error", message: err.message });
  }
};