import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRoutes from './routes/analyzeRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables (.env in cwd or fallback to server/.env for local dev)
dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  const serverEnv = path.resolve(__dirname, '../.env');
  if (fs.existsSync(serverEnv)) {
    dotenv.config({ path: serverEnv });
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (supports both /api/health and /health)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'rolefit-backend',
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here'
    )
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Root info endpoints
const rootInfoHandler = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'rolefit-backend',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/analyze']
  });
};

app.get('/api', rootInfoHandler);

// Mount analyze routes under both '/api' and '/' for maximum serverless rewrite compatibility
app.use('/api', analyzeRoutes);
app.use('/', analyzeRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.'
  });
});

export default app;
