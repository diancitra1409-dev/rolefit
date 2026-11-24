import { GoogleGenAI, Type } from '@google/genai';

/**
 * Service to interact with Gemini 2.5 Flash using structured outputs
 */
export async function analyzeFit({ resumeText, jobDescription }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set a valid key in server/.env'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an elite technical recruiter, senior hiring manager, and ATS (Applicant Tracking System) specialist.
Your task is to analyze candidate resume text against a target job description with rigorous accuracy, objective scoring, and constructive actionable advice.
Evaluate how well the candidate's skills, qualifications, and experience match the job requirements.
Provide an honest match score from 0 to 100 based on realistic ATS filters and hiring standards.
Output must strictly adhere to the defined JSON schema.`;

  const prompt = `Please evaluate the following candidate resume against the target job description:

=== TARGET JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE RESUME TEXT ===
${resumeText}

Analyze alignment, extract matching and missing keywords, identify up to 4 key candidate strengths relative to the role, and provide up to 4 high-impact actionable suggestions to improve the resume for this position.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      matchScore: {
        type: Type.INTEGER,
        description: 'An ATS match score from 0 to 100 representing how well the resume matches the job requirements.'
      },
      summary: {
        type: Type.STRING,
        description: 'A 2-3 sentence executive assessment of the candidate fit for this specific job.'
      },
      matchedKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Keywords, tools, languages, or qualifications found in both the resume and the job description.'
      },
      missingKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Important keywords, skills, or requirements from the job description missing from the resume.'
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Key candidate strengths relative to the job requirements (maximum 4 points).'
      },
      improvementSuggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalContext: {
              type: Type.STRING,
              description: 'The phrase, section, or gap from the resume/JD.'
            },
            suggestedImprovement: {
              type: Type.STRING,
              description: 'Actionable rewrite, bullet point revision, or skill integration recommendation.'
            },
            reason: {
              type: Type.STRING,
              description: 'Why this change improves ATS ranking or recruiter impression.'
            }
          },
          required: ['originalContext', 'suggestedImprovement', 'reason']
        },
        description: 'Actionable tips to optimize the resume for this role (maximum 4 suggestions).'
      }
    },
    required: [
      'matchScore',
      'summary',
      'matchedKeywords',
      'missingKeywords',
      'strengths',
      'improvementSuggestions'
    ]
  };

  // Candidate models: user-specified, or proven available flash models
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-2.5-flash'
  ].filter(Boolean);

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gemini API returned an empty response.');
      }

      const parsedData = JSON.parse(rawText);

      // Ensure matchScore stays clamped between 0 and 100
      if (typeof parsedData.matchScore === 'number') {
        parsedData.matchScore = Math.max(0, Math.min(100, Math.round(parsedData.matchScore)));
      }

      return parsedData;
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Model ${model} encountered an issue: ${err.message}. Trying next candidate...`);
    }
  }

  if (lastError instanceof SyntaxError) {
    throw new Error(`Failed to parse AI JSON response: ${lastError.message}`);
  }
  throw new Error(`Gemini AI analysis error: ${lastError?.message || 'Unknown error'}`);
}

