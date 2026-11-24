import express from 'express';
import { uploadResume, handleMulterError } from '../middlewares/uploadMiddleware.js';
import { handleAnalyze } from '../controllers/analyzeController.js';

const router = express.Router();

router.post(
  '/analyze',
  (req, res, next) => {
    uploadResume.single('resume')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  handleAnalyze
);

export default router;

