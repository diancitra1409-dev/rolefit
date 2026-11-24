# RoleFit — Smart Resume & Job Description Matcher

RoleFit is a full-stack MVP web application built with a clean monorepo architecture (`client/` and `server/`), configured for seamless single-project deployment on **Vercel** as well as local development. It analyzes candidate resumes against job descriptions using **Google Gemini API** with **Structured Outputs**, providing ATS match scoring, keyword matrix comparisons, candidate strengths, and actionable resume optimization recommendations.

---

## 🚀 Features

- **PDF Resume Upload**: Drag-and-drop or file picker with 5MB validation, MIME/extension checks, and in-memory parsing via `multer.memoryStorage()` (no server disk writes, 100% serverless-ready).
- **Job Description Input**: Clean textarea with real-time word and character counters, plus a "Paste Sample JD" quick-fill button.
- **Gemini Structured Outputs**: Strict JSON schema evaluation acting as an expert ATS specialist and senior technical recruiter.
- **ATS Match Score Gauge**: Circular SVG progress gauge color-coded by match level:
  - 🟢 **Green (>= 75)**: Strong Match
  - 🟡 **Amber (50 - 74)**: Moderate Match
  - 🔴 **Red (< 50)**: Low Match / Optimization Needed
- **Keyword Matrix**: Side-by-side pill badges distinguishing **Matched Keywords** from **Missing Keywords**.
- **Candidate Strengths**: Top competitive advantages aligned with the target role (max 4).
- **Actionable ATS Optimizations**: Targeted rewrites detailing the resume gap, recommended phrasing, and recruiter impact (max 4).
- **Vercel Ready**: Full monorepo configuration deploying both the Vite React SPA and Express API as serverless functions in one project.
- **Relative Path API**: Client communicates using relative `/api/*` endpoints in production and development proxies locally.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 18** + **Vite 6**
- **Tailwind CSS** (Modern slate & indigo SaaS theme)
- **Lucide React** (Clean icons)

### Backend (`server/` & `api/`)
- **Node.js** + **Express**
- **@google/genai** (Official Google Gen AI SDK)
- **multer** (`memoryStorage` for direct in-memory buffer processing without disk I/O)
- **pdf-parse** (Extracts plain text from in-memory resume PDF buffer)
- **cors**, **dotenv**

---

## 📁 Repository Structure

```text
rolefit/
├── api/
│   └── index.js                    # Serverless entry point exporting Express app for Vercel
├── vercel.json                     # Vercel deployment configuration (build, output, and rewrites)
├── client/                         # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ImprovementSuggestions.jsx
│   │   │   ├── JobDescriptionInput.jsx
│   │   │   ├── KeywordsBadges.jsx
│   │   │   ├── ResultsDashboard.jsx
│   │   │   ├── ScoreGauge.jsx
│   │   │   ├── StrengthsList.jsx
│   │   │   └── SummaryCard.jsx
│   │   ├── services/
│   │   │   └── api.js              # Fetch client using relative /api paths
│   │   ├── App.jsx                 # Application layout & state orchestration
│   │   ├── index.css               # Tailwind CSS directives
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js              # Vite dev server with proxy to port 5000
│   └── package.json
│
├── server/                         # Backend Express API
│   ├── src/
│   │   ├── app.js                  # Modular Express app (reusable for serverless & local)
│   │   ├── index.js                # Local Express HTTP listener on port 5000
│   │   ├── controllers/
│   │   │   └── analyzeController.js# Validates inputs and handles response
│   │   ├── middlewares/
│   │   │   └── uploadMiddleware.js # Multer 5MB memory storage & PDF filter
│   │   ├── routes/
│   │   │   └── analyzeRoutes.js    # POST /api/analyze
│   │   └── services/
│   │       ├── geminiService.js    # Gemini SDK with strict JSON schema & model fallbacks
│   │       └── pdfService.js       # pdf-parse in-memory text extractor
│   ├── scripts/
│   │   ├── generateSampleResume.js # Creates sample_resume.pdf for testing
│   │   └── testAnalyzeEndpoint.js  # Automated backend validation suite
│   ├── .env.example                # Template with GEMINI_API_KEY & PORT
│   ├── .env                        # Local environment variables
│   └── package.json
│
├── sample_resume.pdf               # Ready-to-use sample candidate resume
├── .gitignore                      # Ignores node_modules, .env, build output
├── package.json                    # Root monorepo scripts & serverless dependencies
└── README.md
```

---

## ☁️ Deploying to Vercel (Single Project)

Deploying both the client and server together on Vercel requires **zero manual configuration** beyond adding your API key:

### 1. Import Git Repository
1. Push this project to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), click **"Add New..."** -> **"Project"** and import the repository.
3. Keep the **Root Directory** as `./` (default).

### 2. Configure Environment Variable
In Vercel's **Configure Project** screen (or under **Settings -> Environment Variables**):
- **Key**: `GEMINI_API_KEY`
- **Value**: `your_actual_gemini_api_key_here`

### 3. Deploy
Click **Deploy**! Vercel will:
1. Run `npm install` at root (installing all serverless dependencies).
2. Execute the `buildCommand`: `cd client && npm install && npm run build`.
3. Publish `client/dist` as the global static frontend CDN.
4. Route all `/api/*` traffic automatically to the serverless Express function `api/index.js`.

---

## 🚦 Local Development

### 1. Configure Backend Environment
Create or edit `server/.env`:
```ini
PORT=5000
GEMINI_API_KEY=AIzaSy...
```

### 2. Start Both Services
From the root directory:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run server

# Terminal 2: Frontend Client (runs on http://localhost:3000)
npm run client
```

### 3. Open in Browser
Visit **`http://localhost:3000`**. The Vite development server automatically proxies all `/api/*` calls to the local Express backend on port 5000.

---

## 🧪 Testing with Included Sample Data

1. A pre-generated sample resume is available at the root: `sample_resume.pdf` (Alex Chen, Senior Full-Stack Engineer).
2. Open `http://localhost:3000` (or your deployed Vercel domain).
3. Drag & drop or browse to select `sample_resume.pdf`.
4. Click the **"Paste Sample JD"** button above the job description box to automatically insert a target Senior Full-Stack Engineer job description.
5. Click **"Analyze Match"** to trigger the AI ATS evaluation.

---

## 🔒 Serverless Safety & In-Memory Upload

- **No Disk Writes**: Resumes are parsed completely from memory buffer via `multer.memoryStorage()`. This ensures 100% compatibility with Vercel's ephemeral read-only serverless filesystem.
- **Relative URL Dispatch**: In production, `fetch('/api/analyze')` targets the same host, allowing Vercel's edge network to route requests with minimal latency.
- **Strict JSON Schema**: AI responses are guaranteed to follow the exact ATS schema with match score, keywords, strengths, and actionable optimizations.
