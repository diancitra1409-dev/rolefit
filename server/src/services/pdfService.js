import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Extracts plain text from a PDF Buffer.
 * @param {Buffer} buffer - In-memory PDF buffer from multer
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromPDF(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Valid PDF buffer is required for extraction.');
  }

  try {
    const data = await pdf(buffer);
    const text = data.text ? data.text.trim() : '';

    // Validate if the PDF has sufficient extractable text (e.g. not an image-only scan)
    if (text.length < 30) {
      throw new Error(
        'The uploaded PDF contains little or no extractable text. Please ensure it is a text-selectable PDF and not a flattened image scan.'
      );
    }

    return text;
  } catch (err) {
    // Re-throw our custom error or wrap pdf-parse internal errors
    if (err.message && err.message.includes('extractable text')) {
      throw err;
    }
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}

