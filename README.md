# RoleFit — Smart Resume & Job Description Matcher

RoleFit is a full-stack MVP web application built with a clean monorepo architecture (`client/` and `server/`). It analyzes candidate resumes against job descriptions using **Google Gemini 2.5 Flash** with **Structured Outputs**, providing ATS match scoring, keyword matrix comparisons, candidate strengths, and actionable resume optimization recommendations.

---

## 🚀 Features

- **PDF Resume Upload**: Drag-and-drop or file picker with 5MB validation, MIME/extension checks, and in-memory parsing.
- **Job Description Input**: Clean textarea with real-time word and character counters, plus a "Paste Sample JD" quick-fill button.
- **Gemini 2.5 Flash Structured Outputs**: Strict JSON schema evaluation acting as an expert ATS specialist and senior technical recruiter.
- **ATS Match Score Gauge**: Circular SVG progress gauge color-coded by match level:
  - 🟢 **Green (>= 75)**: Strong Match
  - 🟡 **Amber (50 - 74)**: Moderate Match
  - 🔴 **Red (< 50)**: Low Match / Optimization Needed
- **Keyword Matrix**: Side-by-side pill badges distinguishing **Matched Keywords** from **Missing Keywords**.
- **Candidate Strengths**: Top competitive advantages aligned with the target role (max 4).
- **Actionable ATS Optimizations**: Targeted rewrites detailing the resume gap, recommended phrasing, and recruiter impact (max 4).
- **Graceful Error Handling**: Helpful alerts for missing fields, non-PDF files, unselectable/scanned PDFs, and API key configuration.
- **Reset Workflow**: Seamless "Reset / Analyze Another" button to clear state and test multiple roles.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 18** + **Vite 6**
- **Tailwind CSS** (Modern slate & indigo SaaS theme)
- **Lucide React** (Clean icons)

### Backend (`server/`)
- **Node.js** + **Express**
- **@google/genai** (Official Google Gen AI SDK for Gemini 2.5 Flash)
- **multer** (Memory storage for direct buffer extraction without disk clutter)
- **pdf-parse** (Extracts plain text from resume PDF)
- **cors**, **dotenv**

---

## 📁 Repository Structure

```text
rolefit/
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
│   │   │   └── api.js              # Fetch client wrapper
│   │   ├── App.jsx                 # Application layout & state orchestration
│   │   ├── index.css               # Tailwind CSS directives
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js              # Configured with proxy to port 5000
│   └── package.json
│
├── server/                         # Backend Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   └── analyzeController.js# Validates inputs and handles response
│   │   ├── middlewares/
│   │   │   └── uploadMiddleware.js # Multer 5MB memory storage & PDF filter
│   │   ├── routes/
│   │   │   └── analyzeRoutes.js    # POST /api/analyze
│   │   ├── services/
│   │   │   ├── geminiService.js    # Gemini 2.5 Flash SDK with strict JSON schema
│   │   │   └── pdfService.js       # pdf-parse text extractor
│   │   └── index.js                # Express app listener & health endpoint
│   ├── scripts/
│   │   ├── generateSampleResume.js # Creates sample_resume.pdf for testing
│   │   └── testAnalyzeEndpoint.js  # Automated backend validation suite
│   ├── .env.example                # Template with GEMINI_API_KEY & PORT
│   ├── .env                        # Local environment variables
│   └── package.json
│
├── sample_resume.pdf               # Ready-to-use sample candidate resume
├── .gitignore                      # Ignores node_modules, .env, build output
├── package.json                    # Root monorepo scripts
└── README.md
```

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v24)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Configure Backend Environment
Edit `server/.env` and replace `your_api_key_here` with your actual Gemini API key:
```ini
PORT=5000
GEMINI_API_KEY=AIzaSy...
```

### 3. Start the Backend Server
In a terminal:
```bash
cd server
npm run dev
```
The server will start at `http://localhost:5000`. You can verify it at `http://localhost:5000/api/health`.

### 4. Start the Frontend Application
In a separate terminal:
```bash
cd client
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Testing with Included Sample Data

1. A pre-generated sample resume is available at the root: `sample_resume.pdf` (Alex Chen, Senior Full-Stack Engineer).
2. Open `http://localhost:3000`.
3. Drag & drop or browse to select `sample_resume.pdf`.
4. Click the **"Paste Sample JD"** button above the job description box to automatically insert a target Senior Full-Stack Engineer job description.
5. Click **"Analyze Match"** to trigger the AI ATS evaluation.

---

## 🔒 API Specification

### `POST /api/analyze`
**Request:**
- `Content-Type: multipart/form-data`
- `resume`: Binary PDF file (max 5MB)
- `jobDescription`: String (min 20 characters)

**Response Schema (`application/json`):**
```json
{
  "success": true,
  "data": {
    "filename": "sample_resume.pdf",
    "fileSize": 2841,
    "matchScore": 88,
    "summary": "The candidate presents exceptional alignment with the Senior Full-Stack Engineer position...",
    "matchedKeywords": ["React", "TypeScript", "Node.js", "Express", "Tailwind CSS", "PostgreSQL", "Docker", "RESTful APIs"],
    "missingKeywords": ["GraphQL", "Cypress", "AWS / Google Cloud"],
    "strengths": [
      "Over 5 years of verified full-stack development using modern React and Node.js.",
      "Demonstrated impact optimizing page loads by 38% and reducing API latency by 45%."
    ],
    "improvementSuggestions": [
      {
        "originalContext": "Cloud infrastructure and CI/CD",
        "suggestedImprovement": "Explicitly mention AWS services (ECS, S3, RDS) and CI/CD tools (GitHub Actions) utilized in previous deployments.",
        "reason": "Directly satisfies the target job description's cloud platform requirement and prevents ATS keyword filtering."
      }
    ]
  }
}
```

