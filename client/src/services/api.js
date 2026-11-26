/**
 * API service for RoleFit backend communication
 */

const API_BASE = import.meta.env?.VITE_API_URL || '';

/**
 * Validates that the analysis payload matches the schema expected by ResultsDashboard.
 * @param {any} data
 * @returns {boolean}
 */
function isValidAnalysisPayload(data) {
  if (!data || typeof data !== 'object') return false;

  const hasValidScore =
    typeof data.matchScore === 'number' && Number.isFinite(data.matchScore);
  const hasSummary =
    typeof data.summary === 'string' && data.summary.trim().length > 0;
  const hasRequiredArrays =
    Array.isArray(data.matchedKeywords) &&
    Array.isArray(data.missingKeywords) &&
    Array.isArray(data.strengths) &&
    Array.isArray(data.improvementSuggestions);

  return hasValidScore && hasSummary && hasRequiredArrays;
}

/**
 * Uploads resume PDF or sends pasted resume text with job description to the backend analyzer.
 * @param {Object} params
 * @param {File|null} [params.resumeFile] - The PDF resume file
 * @param {string} [params.resumeText] - Pasted plain-text resume content
 * @param {string} params.jobDescription - The target job description text
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeResumeAndJD({ resumeFile, resumeText, jobDescription }) {
  let fetchOptions;

  if (resumeFile) {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);
    fetchOptions = {
      method: 'POST',
      body: formData
    };
  } else {
    fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText: resumeText || '',
        jobDescription
      })
    };
  }

  let response;
  try {
    response = await fetch(`${API_BASE}/api/analyze`, fetchOptions);
  } catch {
    throw new Error(
      'Unable to connect to the analysis server. Please check your network connection or verify that the service is available.'
    );
  }

  let result = null;
  const rawBody = await response.text().catch(() => '');
  if (rawBody) {
    try {
      result = JSON.parse(rawBody);
    } catch {
      result = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (result && typeof result.error === 'string' && result.error.trim()) ||
      `Analysis failed with server status ${response.status} (${response.statusText || 'Error'})`;
    throw new Error(errorMessage);
  }

  if (!result || !result.success || !result.data) {
    throw new Error(
      result?.error || 'Invalid response format received from analysis server.'
    );
  }

  if (!isValidAnalysisPayload(result.data)) {
    throw new Error(
      'The analysis response was incomplete or malformed. Please try analyzing again.'
    );
  }

  return result.data;
}

/**
 * Checks backend health status
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) return { healthy: false };
    return await res.json();
  } catch {
    return { healthy: false };
  }
}
