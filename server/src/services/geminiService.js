import { GoogleGenAI, Type } from '@google/genai';

const MAX_RESUME_CHARS = 7000;
const MAX_JOB_DESCRIPTION_CHARS = 5000;
const PER_MODEL_TIMEOUT_MS = 7500;
const TOTAL_ROTATION_BUDGET_MS = 45000;
const MAX_OUTPUT_TOKENS = 2048;

const EXCLUDED_MODEL_REGEX = /(gemma|embedding|imagen|veo|tts|aqa|nano-banana|-image)/i;
const SPECIALIZED_MODEL_REGEX = /(image|audio|robotics|computer-use|deep-research|customtools)/i;

const FALLBACK_FAST_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.8-flash',
  'gemini-3.6-flash'
];

// Module-level cache shared across warm serverless invocations
const modelCache = {
  apiKey: null,
  models: null,
  modelsPromise: null,
  preferredModel: null
};

/**
 * Clears in-memory model caches (useful for testing).
 */
export function clearModelCache() {
  modelCache.apiKey = null;
  modelCache.models = null;
  modelCache.modelsPromise = null;
  modelCache.preferredModel = null;
}

/**
 * Extracts a numeric major.minor score from a Gemini model ID for tie-breaking.
 * @param {string} modelId
 * @returns {number}
 */
function extractVersionScore(modelId) {
  const match = modelId.match(/gemini-(\d+)(?:\.(\d+))?/i);
  if (!match) return 0;
  const major = Number(match[1]) || 0;
  const minor = Number(match[2]) || 0;
  return major * 100 + minor;
}

/**
 * Determines speed/suitability tier (lower is faster & preferred).
 * @param {string} modelId
 * @returns {number}
 */
function getSpeedTier(modelId) {
  const lower = modelId.toLowerCase();
  if (SPECIALIZED_MODEL_REGEX.test(lower)) return 3;
  if (lower.includes('flash-lite')) return 0;
  if (lower.includes('flash')) return 1;
  return 2;
}

/**
 * Filters active Gemini models supporting generateContent and sorts fastest first.
 * @param {Array<Object>} rawModels - Models returned from ai.models.list()
 * @returns {string[]} Sorted model IDs
 */
export function filterAndSortGeminiModels(rawModels = []) {
  const seen = new Set();
  const eligible = [];

  for (const model of rawModels) {
    const id = (model?.name || '').replace(/^models\//, '').trim();
    if (!id) continue;

    const lower = id.toLowerCase();
    if (!lower.startsWith('gemini-')) continue;
    if (EXCLUDED_MODEL_REGEX.test(lower)) continue;

    const actions = model.supportedActions || model.supportedGenerationMethods || [];
    if (!Array.isArray(actions) || !actions.includes('generateContent')) continue;

    if (!seen.has(id)) {
      seen.add(id);
      eligible.push(id);
    }
  }

  return eligible.sort((a, b) => {
    const tierDiff = getSpeedTier(a) - getSpeedTier(b);
    if (tierDiff !== 0) return tierDiff;

    const aIsUnstable = /(preview|exp)/i.test(a) ? 1 : 0;
    const bIsUnstable = /(preview|exp)/i.test(b) ? 1 : 0;
    if (aIsUnstable !== bIsUnstable) return aIsUnstable - bIsUnstable;

    const versionDiff = extractVersionScore(b) - extractVersionScore(a);
    if (versionDiff !== 0) return versionDiff;

    return a.localeCompare(b);
  });
}

/**
 * Fetches and caches active fast Gemini models once per module lifecycle / API key.
 * @param {GoogleGenAI} ai
 * @param {string} apiKey
 * @returns {Promise<string[]>}
 */
async function getAvailableModels(ai, apiKey) {
  if (modelCache.apiKey !== apiKey) {
    clearModelCache();
    modelCache.apiKey = apiKey;
  }

  if (modelCache.models && modelCache.models.length > 0) {
    return modelCache.models;
  }

  if (!modelCache.modelsPromise) {
    modelCache.modelsPromise = (async () => {
      try {
        const pager = await ai.models.list({
          config: {
            pageSize: 100,
            httpOptions: {
              timeout: 10000,
              retryOptions: { attempts: 1 }
            }
          }
        });

        const rawModels = [];
        if (pager && typeof pager[Symbol.asyncIterator] === 'function') {
          for await (const m of pager) {
            rawModels.push(m);
          }
        } else if (Array.isArray(pager?.page)) {
          rawModels.push(...pager.page);
        } else if (Array.isArray(pager)) {
          rawModels.push(...pager);
        }

        const sorted = filterAndSortGeminiModels(rawModels);
        if (sorted.length === 0) {
          throw new Error('No eligible Gemini generateContent models returned by ai.models.list().');
        }

        modelCache.models = sorted;
        return sorted;
      } catch (err) {
        modelCache.modelsPromise = null;
        throw err;
      }
    })();
  }

  try {
    return await modelCache.modelsPromise;
  } catch (err) {
    console.warn(`[GeminiService] Model discovery failed (${err.message}); using fast fallback list.`);
    return FALLBACK_FAST_MODELS;
  }
}

/**
 * Extracts HTTP status code from SDK errors when available.
 * @param {any} err
 * @returns {number|null}
 */
function getErrorStatus(err) {
  if (typeof err?.status === 'number') return err.status;
  const msg = err?.message || '';
  if (msg.includes('429') || /RESOURCE_EXHAUSTED|quota/i.test(msg)) return 429;
  if (msg.includes('503') || /UNAVAILABLE|overloaded/i.test(msg)) return 503;
  if (msg.includes('401') || msg.includes('403') || /API_KEY_INVALID/i.test(msg)) return 401;
  return null;
}

/**
 * Calls generateContent with a strict 7500ms timeout and single attempt (no SDK backoff sleep).
 */
async function callModelWithTimeout(ai, model, prompt, systemInstruction, responseSchema) {
  const controller = new AbortController();
  const timeoutError = new Error(`Model ${model} timed out after ${PER_MODEL_TIMEOUT_MS}ms`);
  timeoutError.name = 'TimeoutError';

  const timer = setTimeout(() => {
    controller.abort(timeoutError);
  }, PER_MODEL_TIMEOUT_MS);

  try {
    return await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.2,
        abortSignal: controller.signal,
        httpOptions: {
          // Gemini API rejects X-Server-Timeout < 10s with 400 INVALID_ARGUMENT;
          // client-side AbortController enforces the 7500ms per-model timeout cleanly.
          timeout: 10000,
          retryOptions: { attempts: 1 }
        }
      }
    });
  } catch (err) {
    if (controller.signal.aborted && err?.name === 'AbortError') {
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: 'ATS match score from 0 to 100.'
    },
    summary: {
      type: Type.STRING,
      description: 'Concise 1-2 sentence executive fit assessment (max 35 words).'
    },
    matchedKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 10 key matching skills, tools, or qualifications.'
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 10 important missing skills or requirements from the JD.'
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 4 concise bullet points on candidate strengths (max 14 words each).'
    },
    improvementSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalContext: {
            type: Type.STRING,
            description: 'Short phrase or gap from the resume/JD (max 12 words).'
          },
          suggestedImprovement: {
            type: Type.STRING,
            description: 'Concise actionable rewrite or skill addition (max 18 words).'
          },
          reason: {
            type: Type.STRING,
            description: 'Brief ATS/recruiter impact (max 14 words).'
          }
        },
        required: ['originalContext', 'suggestedImprovement', 'reason']
      },
      description: 'Up to 3 concise high-impact resume optimizations.'
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

/**
 * Strips markdown code fences, extracts the outermost JSON object block, and parses it safely.
 * @param {string} rawText
 * @returns {Object}
 */
export function extractAndParseJson(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Model returned an empty response.');
  }

  let cleaned = rawText.trim();

  // Strip ```json ... ``` or ``` ... ``` markdown fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  } else {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // Extract outermost { ... } block so leading/trailing prose cannot break JSON.parse
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new SyntaxError('Response does not contain a valid JSON object.');
  }

  const jsonCandidate = cleaned.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(jsonCandidate);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Parsed JSON response is not an object.');
  }

  return parsed;
}

/**
 * Validates and normalizes the parsed JSON to guarantee exact frontend schema compatibility.
 * @param {Object} parsed
 * @returns {Object}
 */
function normalizeAnalysisResult(parsed) {
  const numericScore = Number(parsed.matchScore);
  if (!Number.isFinite(numericScore)) {
    throw new Error('AI response is missing a valid numeric matchScore.');
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  if (!summary) {
    throw new Error('AI response is missing a summary.');
  }

  const toStringArray = (val) =>
    Array.isArray(val)
      ? val.map((item) => String(item ?? '').trim()).filter(Boolean)
      : [];

  const improvementSuggestions = Array.isArray(parsed.improvementSuggestions)
    ? parsed.improvementSuggestions
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          originalContext: String(item.originalContext ?? '').trim(),
          suggestedImprovement: String(item.suggestedImprovement ?? '').trim(),
          reason: String(item.reason ?? '').trim()
        }))
        .filter(
          (item) => item.originalContext || item.suggestedImprovement || item.reason
        )
    : [];

  return {
    matchScore: Math.max(0, Math.min(100, Math.round(numericScore))),
    summary,
    matchedKeywords: toStringArray(parsed.matchedKeywords),
    missingKeywords: toStringArray(parsed.missingKeywords),
    strengths: toStringArray(parsed.strengths),
    improvementSuggestions
  };
}

/**
 * Analyzes candidate resume against target job description using dynamic fast Gemini model rotation.
 * @param {Object} params
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @param {Function} [params.onStep] - Optional step callback ('call_gemini' | 'parse_json')
 * @param {Object} [params.aiClient] - Optional injected GoogleGenAI-compatible client for testing
 */
export async function analyzeFit({ resumeText, jobDescription, onStep, aiClient }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!aiClient && (!apiKey || apiKey === 'your_api_key_here')) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set a valid key in server/.env'
    );
  }

  const ai = aiClient || new GoogleGenAI({ apiKey });
  const cappedResume = (resumeText || '').slice(0, MAX_RESUME_CHARS);
  const cappedJD = (jobDescription || '').slice(0, MAX_JOB_DESCRIPTION_CHARS);

  const systemInstruction =
    'You are an ATS and technical recruiting specialist. Return strictly valid, concise JSON matching the schema. Keep bullets and strings brief and punchy.';

  const prompt = `Evaluate resume vs job description. Be concise so all fields fit cleanly in JSON:
- summary: 1-2 crisp sentences (<=35 words)
- matchedKeywords & missingKeywords: <=10 short terms each
- strengths: <=4 short bullets (<=14 words each)
- improvementSuggestions: <=3 concise items

=== JOB DESCRIPTION ===
${cappedJD}

=== RESUME ===
${cappedResume}`;

  const discoveredModels = await getAvailableModels(ai, apiKey || 'custom-client');

  // Put the last known working model first, followed by remaining fast-sorted models
  const candidateModels = [];
  if (modelCache.preferredModel && discoveredModels.includes(modelCache.preferredModel)) {
    candidateModels.push(modelCache.preferredModel);
  }
  if (process.env.GEMINI_MODEL && !EXCLUDED_MODEL_REGEX.test(process.env.GEMINI_MODEL)) {
    if (!candidateModels.includes(process.env.GEMINI_MODEL)) {
      candidateModels.push(process.env.GEMINI_MODEL);
    }
  }
  for (const model of discoveredModels) {
    if (!candidateModels.includes(model)) {
      candidateModels.push(model);
    }
  }
  for (const fallbackModel of FALLBACK_FAST_MODELS) {
    if (!candidateModels.includes(fallbackModel)) {
      candidateModels.push(fallbackModel);
    }
  }

  const startTime = Date.now();
  let lastError = null;

  for (const model of candidateModels) {
    if (Date.now() - startTime >= TOTAL_ROTATION_BUDGET_MS) {
      break;
    }

    try {
      onStep?.('call_gemini');
      const response = await callModelWithTimeout(
        ai,
        model,
        prompt,
        systemInstruction,
        RESPONSE_SCHEMA
      );

      onStep?.('parse_json');
      const rawText = response?.text;
      if (!rawText || !rawText.trim()) {
        const finishReason = response?.candidates?.[0]?.finishReason;
        throw new Error(
          `Model ${model} returned an empty response${finishReason ? ` (finishReason: ${finishReason})` : ''}.`
        );
      }

      const parsedData = extractAndParseJson(rawText);
      const normalizedResult = normalizeAnalysisResult(parsedData);

      // Cache whichever model succeeded for subsequent requests
      modelCache.preferredModel = model;
      return normalizedResult;
    } catch (err) {
      lastError = err;
      const status = getErrorStatus(err);

      // Fail fast on authentication errors rather than rotating through all models
      if (status === 401 || status === 403) {
        throw new Error(`Gemini authentication failed: ${err.message}`);
      }

      if (modelCache.preferredModel === model) {
        modelCache.preferredModel = null;
      }

      if (status === 429 || status === 503) {
        console.warn(
          `[GeminiService] Model ${model} returned ${status} (${status === 429 ? 'quota' : 'overloaded'}). Rotating to next model...`
        );
      } else {
        console.warn(
          `[GeminiService] Model ${model} failed (${err.message}). Rotating to next model...`
        );
      }
    }
  }

  if (lastError instanceof SyntaxError) {
    throw new Error(`Failed to parse AI JSON response: ${lastError.message}`);
  }
  throw new Error(`Gemini AI analysis error: ${lastError?.message || 'Unknown error'}`);
}
