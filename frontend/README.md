#  AI-Powered Job Tracker with Smart Matching

---

##  Overview

This project is an AI-powered job tracking platform that:

* Fetches job listings
* Matches jobs with user resumes using AI (LangChain)
* Tracks job applications
* Provides an AI assistant to control UI filters in real time (LangGraph)

---

##  Local Development URLs

During development, the application runs on:

* **Frontend (React - Vite):** http://localhost:5173
* **Backend (Fastify API):** http://localhost:5000

Example API call:

```javascript
fetch("http://localhost:5000/jobs")
```

---

#  Architecture

```
Frontend (React)
   ↓
Backend (Fastify APIs)
   ↓
 ┌───────────────┬───────────────┬───────────────┐
 │ In-Memory DB  │ LangChain     │ LangGraph     │
 │ (Jobs/Resume) │ (Matching)    │ (AI Assistant)│
 └───────────────┴───────────────┴───────────────┘
                     ↓
                OpenAI API
```

### Data Flow

1. User uploads resume → stored in backend
2. Jobs fetched → displayed in UI
3. LangChain compares resume with jobs → score generated
4. AI chat → LangGraph detects intent
5. Filters updated → UI updates
6. User applies → application stored

---

#  Tech Stack

* Frontend: React (Vite)
* Backend: Node.js + Fastify
* AI Matching: LangChain
* AI Assistant: LangGraph
* LLM: OpenAI
* Storage: In-memory

---

#  Features

### Job Feed

* Displays job title, company, location
* Apply button for each job

---

### Resume Upload

* Upload PDF or TXT
* Resume stored per user

---

### AI Job Matching (LangChain)

* Compares resume with job skills
* Generates match score (0–100%)
* Shows matching skills and explanation

---

### Best Matches

* Displays top jobs based on score

---

### Smart Filters

* Search by title
* Filter by job type, mode, location
* Match score filtering

---

### Application Tracking

* Apply → opens job link
* Popup asks user status
* Stores application

---

### AI Assistant (LangGraph)

* Chat-based interaction
* Example queries:

  * "Show remote jobs"
  * "Hybrid jobs"
* Updates UI filters automatically

---

#  LangChain & LangGraph Usage

## 🔹 LangChain – Job Matching

### How it works

LangChain compares resume and job details to generate a match score.

### Implementation

```javascript
const prompt = ChatPromptTemplate.fromTemplate(`
Compare resume and job skills.
Return score (0–100).
`);

const chain = prompt.pipe(llm).pipe(new StringOutputParser());

const result = await chain.invoke({
  resume,
  job
});
```

### Why it works

* Understands unstructured text
* Matches skills semantically
* Provides explainable output

---

##  LangGraph – AI Assistant

### Graph Structure

```
START → detectIntent → applyFilter → response → END
```

### Nodes

* detectIntent → identifies user query
* applyFilter → selects filters
* response → returns reply

### UI Control

```json
{
  "filter": "remote"
}
```

Frontend applies:

```javascript
setMode("Remote");
```

---

#  AI Matching Logic

### Scoring Approach

* Skill matching percentage
* Resume vs job keyword comparison

### Why it works

* Uses LLM understanding
* Handles different formats

### Performance

* Fast (<2 seconds)
* Lightweight prompts

---

#  Popup Flow Design

### Flow

1. User clicks Apply
2. Job link opens
3. Popup asks:

   * Yes
   * No
   * Applied earlier

### Why this design

* Tracks user action
* Improves UX

### Edge Cases

* User exits page
* Multiple applications

### Alternatives

* Auto tracking (not reliable)
* Manual input (bad UX)

---

#  AI Assistant UI Choice

### Choice: Chat Bubble

### Reason

* Non-intrusive
* Easy access
* Familiar UX

---

#  Scalability

### 100+ Jobs

* Efficient filtering
* Sorting by score

### 10,000 Users

* Can use MongoDB
* Add caching (Redis)
* Scale backend

---

#  Tradeoffs

### Limitations

* In-memory storage
* Static job data

### Improvements

* Real job APIs
* Advanced embeddings
* Authentication

---

#  Setup Instructions

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```
OPENAI_API_KEY=your_api_key
```

---

#  Deployment

* Frontend: Vercel
* Backend: Render

Replace API URLs after deployment.

---

#  Submission

Live URL: https://your-deployed-url.com
GitHub Repo: https://github.com/yourusername/ai-job-tracker

---

# 👤 Author

MADDENAPELLI SRINITHA
