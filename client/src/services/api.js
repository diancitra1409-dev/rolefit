/**
 * API service for RoleFit backend communication
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Uploads resume PDF and job description to the backend analyzer.
 * @param {Object} params
 * @param {File} params.resumeFile - The PDF resume file
 * @param {string} params.jobDescription - The target job description text
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeResumeAndJD({ resumeFile, jobDescription }) {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);

  let response;
  try {
    response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the server. Please ensure the backend is running on port 5000.'
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      result?.error ||
      `Analysis failed with server status ${response.status} (${response.statusText})`;
    throw new Error(errorMessage);
  }

  if (!result || !result.success || !result.data) {
    throw new Error('Invalid response format received from analysis server.');
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

