import { extractTextFromPDF } from '../services/pdfService.js';
import { analyzeFit } from '../services/geminiService.js';

export const MAX_JOB_DESCRIPTION_CHARS = 5000;

export async function handleAnalyze(req, res, next) {
  try {
    // 1. Validate Resume File
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Resume file is required. Please upload a PDF resume.'
      });
    }

    // 2. Validate & Cap Job Description
    const rawJobDescription = req.body?.jobDescription?.trim();
    if (!rawJobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required. Please paste the target job description.'
      });
    }

    if (rawJobDescription.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Job description is too short. Please provide a more detailed job description (at least 20 characters).'
      });
    }

    const jobDescription = rawJobDescription.slice(0, MAX_JOB_DESCRIPTION_CHARS);

    // 3. Extract text from PDF buffer (capped at 7,000 characters)
    const resumeText = await extractTextFromPDF(req.file.buffer);

    // 4. Analyze with fast rotating Gemini models
    const analysisResult = await analyzeFit({
      resumeText,
      jobDescription
    });

    return res.status(200).json({
      success: true,
      data: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        ...analysisResult
      }
    });
  } catch (err) {
    next(err);
  }
}
