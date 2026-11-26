import { extractTextFromPDF, MAX_RESUME_CHARS } from '../services/pdfService.js';
import { analyzeFit } from '../services/geminiService.js';

export const MAX_JOB_DESCRIPTION_CHARS = 5000;

export async function handleAnalyze(req, res) {
  try {
    // 1. Validate Job Description
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

    // 2. Validate & Extract Resume (supports uploaded PDF or pasted resume text)
    const rawPastedResume =
      typeof req.body?.resumeText === 'string'
        ? req.body.resumeText.trim()
        : typeof req.body?.resume === 'string'
          ? req.body.resume.trim()
          : '';

    let resumeText = '';
    if (req.file) {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else if (rawPastedResume) {
      if (rawPastedResume.length < 30) {
        return res.status(400).json({
          success: false,
          error: 'Pasted resume text is too short. Please provide at least 30 characters.'
        });
      }
      resumeText = rawPastedResume.slice(0, MAX_RESUME_CHARS);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Resume file is required. Please upload a PDF resume or paste your resume text.'
      });
    }

    // 3. Analyze with fast rotating Gemini models
    const analysisResult = await analyzeFit({
      resumeText,
      jobDescription
    });

    return res.status(200).json({
      success: true,
      data: {
        filename: req.file ? req.file.originalname : 'Pasted Resume Text',
        fileSize: req.file ? req.file.size : null,
        ...analysisResult
      }
    });
  } catch (err) {
    console.error('[/api/analyze Controller Error]', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to analyze resume'
    });
  }
}
