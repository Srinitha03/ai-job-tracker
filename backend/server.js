const Fastify = require("fastify");
const cors = require("@fastify/cors");
const { OpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { StateGraph } = require("@langchain/langgraph");
require("dotenv").config();

const app = Fastify({ logger: true });
app.register(cors);

// ============================================
// JOBS DATABASE (9 Jobs with all required fields)
// ============================================
const jobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "Google",
    location: "Mountain View, CA",
    city: "Mountain View",
    country: "USA",
    description: "Build scalable frontend applications using React, Redux, and modern JavaScript. Work on cutting-edge projects.",
    type: "Full-time",
    mode: "Remote",
    skills: ["React", "JavaScript", "Redux", "TypeScript", "HTML/CSS"],
    posted: "2026-03-18",
    postedDate: new Date("2026-03-18"),
    link: "https://careers.google.com/jobs",
    salary: "$150,000 - $200,000",
    experience: "3-5 years"
  },
  {
    id: 2,
    title: "Backend Engineer - Node.js",
    company: "Amazon",
    location: "Bangalore, India",
    city: "Bangalore",
    country: "India",
    description: "Design and implement REST APIs, microservices using Node.js and Express.",
    type: "Full-time",
    mode: "On-site",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "AWS"],
    posted: "2026-03-15",
    postedDate: new Date("2026-03-15"),
    link: "https://www.amazon.jobs",
    salary: "₹1,200,000 - ₹1,800,000",
    experience: "2-4 years"
  },
  {
    id: 3,
    title: "Python Developer",
    company: "Microsoft",
    location: "London, UK",
    city: "London",
    country: "UK",
    description: "Develop Python applications, work with Django framework and data processing pipelines.",
    type: "Contract",
    mode: "Hybrid",
    skills: ["Python", "Django", "Flask", "SQL", "FastAPI"],
    posted: "2026-03-20",
    postedDate: new Date("2026-03-20"),
    link: "https://careers.microsoft.com",
    salary: "£60,000 - £80,000",
    experience: "3+ years"
  },
  {
    id: 4,
    title: "Machine Learning Engineer",
    company: "Meta",
    location: "Seattle, WA",
    city: "Seattle",
    country: "USA",
    description: "Build ML models for recommendation systems using PyTorch and TensorFlow.",
    type: "Full-time",
    mode: "Remote",
    skills: ["Python", "TensorFlow", "PyTorch", "ML", "NLP"],
    posted: "2026-03-10",
    postedDate: new Date("2026-03-10"),
    link: "https://www.metacareers.com",
    salary: "$160,000 - $210,000",
    experience: "3-6 years"
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    city: "Los Gatos",
    country: "USA",
    description: "Manage AWS infrastructure, Kubernetes clusters, and CI/CD pipelines.",
    type: "Full-time",
    mode: "Hybrid",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "Jenkins"],
    posted: "2026-03-22",
    postedDate: new Date("2026-03-22"),
    link: "https://jobs.netflix.com",
    salary: "$170,000 - $220,000",
    experience: "4-7 years"
  },
  {
    id: 6,
    title: "Full Stack Developer",
    company: "Spotify",
    location: "Stockholm, Sweden",
    city: "Stockholm",
    country: "Sweden",
    description: "Work on both frontend and backend using React and Node.js.",
    type: "Part-time",
    mode: "Remote",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "Express"],
    posted: "2026-03-05",
    postedDate: new Date("2026-03-05"),
    link: "https://www.spotifyjobs.com",
    salary: "€50,000 - €70,000",
    experience: "1-3 years"
  },
  {
    id: 7,
    title: "iOS Developer",
    company: "Apple",
    location: "Cupertino, CA",
    city: "Cupertino",
    country: "USA",
    description: "Develop iOS applications using Swift and UIKit.",
    type: "Full-time",
    mode: "On-site",
    skills: ["Swift", "iOS", "UIKit", "Xcode", "Core Data"],
    posted: "2026-03-12",
    postedDate: new Date("2026-03-12"),
    link: "https://www.apple.com/careers",
    salary: "$140,000 - $180,000",
    experience: "2-5 years"
  },
  {
    id: 8,
    title: "UI/UX Designer",
    company: "Adobe",
    location: "San Jose, CA",
    city: "San Jose",
    country: "USA",
    description: "Create user interfaces and experiences using Figma and Adobe XD.",
    type: "Internship",
    mode: "Hybrid",
    skills: ["Figma", "Adobe XD", "UI Design", "UX Research", "Prototyping"],
    posted: "2026-03-01",
    postedDate: new Date("2026-03-01"),
    link: "https://www.adobe.com/careers",
    salary: "$40,000 - $50,000",
    experience: "0-1 years"
  },
  {
    id: 9,
    title: "Data Engineer",
    company: "Oracle",
    location: "Austin, TX",
    city: "Austin",
    country: "USA",
    description: "Build data pipelines using Python, SQL, and Spark.",
    type: "Contract",
    mode: "Remote",
    skills: ["Python", "SQL", "Spark", "Airflow", "Big Data"],
    posted: "2026-03-08",
    postedDate: new Date("2026-03-08"),
    link: "https://www.oracle.com/careers",
    salary: "$130,000 - $170,000",
    experience: "3-6 years"
  }
];

// ============================================
// IN-MEMORY STORAGE
// ============================================
let users = [
  { email: "test@gmail.com", password: "test@123", resume: "" }
];
let applications = [];
let userResumes = {};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================
app.post("/auth/login", async (req, reply) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    return reply.send({ 
      success: true, 
      message: "Login successful", 
      user: { email: user.email }
    });
  }
  
  return reply.status(401).send({ 
    success: false, 
    message: "Invalid credentials" 
  });
});

app.post("/auth/register", async (req, reply) => {
  const { email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return reply.status(400).send({ 
      success: false, 
      message: "User already exists" 
    });
  }
  
  users.push({ email, password, resume: "" });
  return reply.send({ 
    success: true, 
    message: "Registration successful" 
  });
});

// ============================================
// JOBS ENDPOINTS
// ============================================
app.get("/jobs", async (req, reply) => {
  return reply.send(jobs);
});

app.get("/jobs/:id", async (req, reply) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return reply.status(404).send({ error: "Job not found" });
  return reply.send(job);
});

app.get("/jobs/filter", async (req, reply) => {
  let filtered = [...jobs];
  const { title, type, mode, location, minMatch, dateRange } = req.query;
  
  if (title) {
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  
  if (type && type !== 'all') {
    filtered = filtered.filter(j => j.type === type);
  }
  
  if (mode && mode !== 'all') {
    filtered = filtered.filter(j => j.mode === mode);
  }
  
  if (location) {
    filtered = filtered.filter(j => 
      j.city.toLowerCase().includes(location.toLowerCase()) ||
      j.country.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (dateRange) {
    const now = new Date();
    const days = parseInt(dateRange);
    if (days) {
      const cutoff = new Date(now.setDate(now.getDate() - days));
      filtered = filtered.filter(j => j.postedDate >= cutoff);
    }
  }
  
  return reply.send(filtered);
});

// ============================================
// RESUME ENDPOINTS
// ============================================
app.post("/resume", async (req, reply) => {
  const { email, resume } = req.body;
  if (!email) return reply.status(400).send({ error: "Email required" });
  
  userResumes[email] = {
    resume,
    skills: extractSkills(resume),
    updatedAt: new Date().toISOString()
  };
  
  return reply.send({ success: true, message: "Resume saved" });
});

app.get("/resume", async (req, reply) => {
  const { email } = req.query;
  if (!email) return reply.status(400).send({ error: "Email required" });
  
  return reply.send({
    resume: userResumes[email]?.resume || "",
    skills: userResumes[email]?.skills || []
  });
});

function extractSkills(resume) {
  const skills = [];
  const skillKeywords = ["python", "react", "node.js", "javascript", "java", 
    "typescript", "aws", "docker", "kubernetes", "sql", "mongodb"];
  
  const resumeLower = resume.toLowerCase();
  skillKeywords.forEach(skill => {
    if (resumeLower.includes(skill)) skills.push(skill);
  });
  
  return skills;
}

// ============================================
// AI MATCHING WITH LANGCHAIN
// ============================================
const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.3,
  modelName: "gpt-3.5-turbo"
});

app.post("/ai-match", async (req, reply) => {
  const { resume, job } = req.body;
  
  if (!resume) {
    return reply.send({ result: "Upload resume to see match", score: 0 });
  }
  
  try {
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an AI job matching expert. Compare the candidate's resume with the job description.
      
      Resume: {resume}
      
      Job Title: {title}
      Job Description: {description}
      Required Skills: {skills}
      
      Calculate a match score from 0-100 based on:
      1. Skills match (60% weight)
      2. Experience relevance (30% weight)
      3. Keywords alignment (10% weight)
      
      Return ONLY a JSON object with:
      - score: number (0-100)
      - matchingSkills: array of matching skills
      - explanation: brief explanation of match
    `);
    
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({
      resume: resume.substring(0, 2000),
      title: job.title,
      description: job.description,
      skills: job.skills.join(", ")
    });
    
    const parsed = JSON.parse(result);
    return reply.send({ result: parsed.explanation, score: parsed.score, matchingSkills: parsed.matchingSkills });
  } catch (err) {
    console.error("AI Match error:", err);
    return reply.send({ result: "Match analysis unavailable", score: 0 });
  }
});

// ============================================
// LANGGRAPH AI ASSISTANT
// ============================================
class AIAssistant {
  constructor() {
    this.graph = this.buildGraph();
    this.state = {
      messages: [],
      currentFilters: {
        mode: null,
        type: null,
        dateRange: null,
        title: null,
        location: null,
        matchScore: null
      }
    };
  }
  
  buildGraph() {
    const workflow = new StateGraph({
      channels: {
        messages: "array",
        intent: "string",
        filters: "object",
        response: "string"
      }
    });
    
    // Node 1: Detect Intent
    workflow.addNode("detectIntent", async (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      
      const intentPrompt = ChatPromptTemplate.fromTemplate(`
        Analyze this user message and determine the intent.
        Message: {message}
        
        Intent types:
        - JOB_SEARCH: Looking for jobs with specific criteria
        - FILTER_JOBS: Apply filters to job listing
        - HELP: Asking how to use the app
        - GENERAL: General conversation
        
        Return ONLY the intent type.
      `);
      
      const chain = intentPrompt.pipe(llm).pipe(new StringOutputParser());
      const intent = await chain.invoke({ message: lastMessage });
      
      return { ...state, intent: intent.trim() };
    });
    
    // Node 2: Extract Filters
    workflow.addNode("extractFilters", async (state) => {
      if (state.intent !== "JOB_SEARCH" && state.intent !== "FILTER_JOBS") {
        return state;
      }
      
      const lastMessage = state.messages[state.messages.length - 1];
      
      const filterPrompt = ChatPromptTemplate.fromTemplate(`
        Extract job filters from this message:
        "{message}"
        
        Available filters:
        - mode: remote, hybrid, onsite
        - type: full-time, part-time, contract, internship
        - dateRange: 1 (24h), 7 (week), 30 (month)
        - title: job title keywords
        - location: city or country
        - matchScore: high (>70%), medium (40-70%)
        
        Return JSON only: {{"mode": null, "type": null, "dateRange": null, "title": null, "location": null, "matchScore": null}}
      `);
      
      const chain = filterPrompt.pipe(llm).pipe(new StringOutputParser());
      const filtersJson = await chain.invoke({ message: lastMessage });
      
      try {
        const filters = JSON.parse(filtersJson);
        return { ...state, filters: { ...state.filters, ...filters } };
      } catch {
        return state;
      }
    });
    
    // Node 3: Generate Response
    workflow.addNode("generateResponse", async (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      
      let responsePrompt;
      
      if (state.intent === "HELP") {
        responsePrompt = ChatPromptTemplate.fromTemplate(`
          You are a helpful AI assistant for a job tracking app. Answer this help question:
          "{message}"
          
          Features available:
          - Upload resume to get match scores
          - Filter jobs by mode, type, location
          - AI can control filters for you
          - Track applications in dashboard
          
          Provide a helpful, concise answer.
        `);
      } else if (state.intent === "JOB_SEARCH" || state.intent === "FILTER_JOBS") {
        const activeFilters = Object.entries(state.filters)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        
        responsePrompt = ChatPromptTemplate.fromTemplate(`
          You are a job search assistant. User asked: "{message}"
          Active filters: {filters}
          
          Generate a friendly response confirming the filters applied and suggesting next steps.
          If no filters, encourage them to try specific searches.
        `);
      } else {
        responsePrompt = ChatPromptTemplate.fromTemplate(`
          You are a friendly job search assistant. Respond to: "{message}"
          Keep it short and helpful.
        `);
      }
      
      const chain = responsePrompt.pipe(llm).pipe(new StringOutputParser());
      const response = await chain.invoke({ 
        message: lastMessage,
        filters: JSON.stringify(state.filters)
      });
      
      return { ...state, response };
    });
    
    // Add edges
    workflow.addEdge("__start__", "detectIntent");
    workflow.addEdge("detectIntent", "extractFilters");
    workflow.addEdge("extractFilters", "generateResponse");
    workflow.addEdge("generateResponse", "__end__");
    
    return workflow.compile();
  }
  
  async processMessage(message) {
    this.state.messages.push(message);
    
    const result = await this.graph.invoke({
      messages: this.state.messages,
      intent: "",
      filters: this.state.currentFilters,
      response: ""
    });
    
    // Update filters
    this.state.currentFilters = { ...this.state.currentFilters, ...result.filters };
    
    return {
      reply: result.response,
      filters: result.filters,
      intent: result.intent
    };
  }
  
  reset() {
    this.state = {
      messages: [],
      currentFilters: {
        mode: null,
        type: null,
        dateRange: null,
        title: null,
        location: null,
        matchScore: null
      }
    };
  }
}

const aiAssistant = new AIAssistant();

app.post("/ai-chat", async (req, reply) => {
  const { message } = req.body;
  
  if (!message) {
    return reply.status(400).send({ reply: "Message is required", filters: null });
  }
  
  try {
    const result = await aiAssistant.processMessage(message);
    
    return reply.send({
      reply: result.reply,
      filters: result.filters,
      intent: result.intent
    });
  } catch (err) {
    console.error("AI Chat error:", err);
    return reply.status(500).send({ 
      reply: "Sorry, I encountered an error. Please try again.",
      filters: null
    });
  }
});

app.post("/ai-chat/reset", async (req, reply) => {
  aiAssistant.reset();
  return reply.send({ success: true, message: "Chat reset" });
});

// ============================================
// APPLICATIONS ENDPOINTS
// ============================================
app.post("/apply", async (req, reply) => {
  const application = {
    id: applications.length + 1,
    ...req.body,
    status: "Applied",
    appliedDate: new Date().toISOString(),
    timeline: [{
      status: "Applied",
      date: new Date().toISOString()
    }]
  };
  
  applications.push(application);
  return reply.send({ success: true, application });
});

app.put("/apply/:id/status", async (req, reply) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const application = applications.find(a => a.id === parseInt(id));
  if (!application) {
    return reply.status(404).send({ error: "Application not found" });
  }
  
  application.status = status;
  application.timeline.push({
    status,
    date: new Date().toISOString()
  });
  
  return reply.send({ success: true, application });
});

app.get("/applications", async (req, reply) => {
  const { email } = req.query;
  if (email) {
    return reply.send(applications.filter(a => a.email === email));
  }
  return reply.send(applications);
});

app.get("/applications/stats", async (req, reply) => {
  const stats = {
    total: applications.length,
    byStatus: {
      Applied: applications.filter(a => a.status === "Applied").length,
      Interview: applications.filter(a => a.status === "Interview").length,
      Offer: applications.filter(a => a.status === "Offer").length,
      Rejected: applications.filter(a => a.status === "Rejected").length
    }
  };
  return reply.send(stats);
});

// ============================================
// START SERVER
// ============================================
const start = async () => {
  try {
    await app.listen({ port: 5000, host: "0.0.0.0" });
    console.log("\n" + "=".repeat(60));
    console.log("🚀 AI-Powered Job Tracker Server Started");
    console.log("=".repeat(60));
    console.log(`📡 Server: http://localhost:5000`);
    console.log(`📊 Jobs loaded: ${jobs.length}`);
    console.log(`🤖 LangChain AI Matching: Active`);
    console.log(`🔄 LangGraph Assistant: Active`);
    console.log("=".repeat(60));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();