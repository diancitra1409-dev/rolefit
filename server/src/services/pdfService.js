import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Import pdf-parse internals directly so Vercel serverless never triggers index.js test-file lookup
const pdf = require('pdf-parse/lib/pdf-parse.js');
// Pre-require pdf.js runtime so @vercel/nft bundles v1.10.100/build/pdf.js & pdf.worker.js
try {
  require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');
} catch {
  // Fallback handled by pdf-parse if path layout differs
}

export const MAX_RESUME_CHARS = 7000;

/**
 * Extracts plain text from a PDF Buffer, stopping early once MAX_RESUME_CHARS is reached.
 * @param {Buffer} buffer - In-memory PDF buffer from multer
 * @returns {Promise<string>} - Extracted text capped at MAX_RESUME_CHARS
 */
export async function extractTextFromPDF(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Valid PDF buffer is required for extraction.');
  }

  try {
    let extractedChars = 0;

    const pagerender = async (pageData) => {
      if (extractedChars >= MAX_RESUME_CHARS) {
        return '';
      }

      const textContent = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });

      let lastY;
      let pageText = '';
      const remainingBudget = MAX_RESUME_CHARS - extractedChars + 200;

      for (const item of textContent.items) {
        if (lastY === item.transform[5] || lastY === undefined) {
          pageText += item.str;
        } else {
          pageText += '\n' + item.str;
        }
        lastY = item.transform[5];

        if (pageText.length >= remainingBudget) {
          break;
        }
      }

      extractedChars += pageText.trim().length;
      return pageText;
    };

    const data = await pdf(buffer, { pagerender });
    const text = (data.text ? data.text.trim() : '').slice(0, MAX_RESUME_CHARS).trim();

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
