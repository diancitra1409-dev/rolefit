import express from 'express';
import multer from 'multer';
import { uploadResume, handleMulterError } from '../middlewares/uploadMiddleware.js';
import { handleAnalyze } from '../controllers/analyzeController.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      uploadResume.single('resume')(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    await handleAnalyze(req, res);
  } catch (err) {
    if (err instanceof multer.MulterError || err?.status === 400) {
      return handleMulterError(err, req, res);
    }
    console.error('[/api/analyze Route Error]', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to analyze resume'
    });
  }
});

export default router;
