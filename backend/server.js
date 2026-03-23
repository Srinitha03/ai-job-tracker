const Fastify = require("fastify");
const cors = require("@fastify/cors");
require("dotenv").config();

const app = Fastify({ logger: true });
app.register(cors);

// ============================================
// JOBS DATABASE - 9 Jobs
// ============================================
const jobs = [
  {
    id: 1,
    title: "AI Engineer",
    company: "Google",
    location: "Mountain View, CA",
    city: "Mountain View",
    country: "USA",
    description: "Build scalable frontend applications using React, Redux, and modern JavaScript.",
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
    title: "Frontend Developer",
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
    title: "Backend Developer",
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
    title: "Data Scientist",
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
// STORAGE
// ============================================
let users = [
  { email: "test@gmail.com", password: "test@123" }
];
let applications = [];
let userResumes = {};

// ============================================
// AUTH ENDPOINTS
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
  users.push({ email, password });
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

// ============================================
// RESUME ENDPOINTS
// ============================================
app.post("/resume", async (req, reply) => {
  const { email, resume } = req.body;
  if (!email) return reply.status(400).send({ error: "Email required" });
  
  userResumes[email] = { resume, updatedAt: new Date().toISOString() };
  return reply.send({ success: true, message: "Resume saved" });
});

app.get("/resume", async (req, reply) => {
  const { email } = req.query;
  if (!email) return reply.status(400).send({ error: "Email required" });
  return reply.send({ resume: userResumes[email]?.resume || "" });
});

// ============================================
// AI MATCHING (Simple Skill-based)
// ============================================
app.post("/ai-match", async (req, reply) => {
  const { resume, job } = req.body;
  
  if (!resume) {
    return reply.send({ result: "Upload resume to see match", score: 0 });
  }
  
  try {
    const resumeLower = resume.toLowerCase();
    let matchCount = 0;
    
    job.skills.forEach(skill => {
      if (resumeLower.includes(skill.toLowerCase())) {
        matchCount++;
      }
    });
    
    const score = Math.round((matchCount / job.skills.length) * 100);
    const matchingSkills = job.skills.filter(skill => 
      resumeLower.includes(skill.toLowerCase())
    );
    
    let explanation = "";
    if (score > 70) explanation = "Great match! Your skills align well with this role.";
    else if (score >= 40) explanation = "Good match. Consider highlighting relevant skills in your resume.";
    else explanation = "Low match. Try adding relevant skills to your resume.";
    
    return reply.send({ 
      result: explanation, 
      score: score, 
      matchingSkills: matchingSkills 
    });
  } catch (err) {
    console.error("AI Match error:", err);
    return reply.send({ result: "Match analysis unavailable", score: 0 });
  }
});

// ============================================
// AI CHAT ASSISTANT - Simple but Powerful
// ============================================
app.post("/ai-chat", async (req, reply) => {
  const { message } = req.body;
  
  if (!message) {
    return reply.status(400).send({ reply: "Message is required", filter: null });
  }

  try {
    const messageLower = message.toLowerCase();
    let filter = null;
    let replyMessage = "";
    
    // Check for remote jobs
    if (messageLower.includes("remote")) {
      filter = "remote";
      replyMessage = "✅ Showing remote jobs! I've applied the Remote filter for you. You can now see only remote positions.";
    }
    // Check for hybrid jobs
    else if (messageLower.includes("hybrid")) {
      filter = "hybrid";
      replyMessage = "✅ Showing hybrid jobs! I've applied the Hybrid filter for you. These jobs combine office and remote work.";
    }
    // Check for onsite jobs
    else if (messageLower.includes("onsite") || messageLower.includes("on-site") || messageLower.includes("office")) {
      filter = "onsite";
      replyMessage = "✅ Showing on-site jobs! I've applied the On-site filter for you. These jobs require working from the office.";
    }
    // Check for full-time jobs
    else if (messageLower.includes("full time") || messageLower.includes("full-time")) {
      filter = "full-time";
      replyMessage = "✅ Showing full-time jobs! I've applied the Full-time filter for you.";
    }
    // Check for part-time jobs
    else if (messageLower.includes("part time") || messageLower.includes("part-time")) {
      filter = "part-time";
      replyMessage = "✅ Showing part-time jobs! I've applied the Part-time filter for you.";
    }
    // Check for contract jobs
    else if (messageLower.includes("contract")) {
      filter = "contract";
      replyMessage = "✅ Showing contract jobs! I've applied the Contract filter for you.";
    }
    // Check for internship jobs
    else if (messageLower.includes("intern")) {
      filter = "internship";
      replyMessage = "✅ Showing internship jobs! I've applied the Internship filter for you.";
    }
    // Check for high match
    else if (messageLower.includes("high match") || messageLower.includes("high score") || messageLower.includes("best match")) {
      filter = "high_match";
      replyMessage = "✅ Showing high match jobs (>70%)! I've applied the High Match filter for you.";
    }
    // Check for clear all filters
    else if (messageLower.includes("clear") && (messageLower.includes("filter") || messageLower.includes("all"))) {
      filter = "all";
      replyMessage = "✅ All filters cleared! Showing all available jobs.";
    }
    // Help responses
    else if (messageLower.includes("help") || messageLower.includes("how to") || messageLower.includes("what can you do")) {
      replyMessage = "💡 I can help you find jobs! Try asking:\n\n• 'Show remote jobs'\n• 'Find hybrid positions'\n• 'Full-time jobs'\n• 'Contract jobs'\n• 'High match scores'\n• 'Clear all filters'";
    }
    else if (messageLower.includes("application") || messageLower.includes("applied")) {
      replyMessage = "📋 Click the 'View Applications' button at the top right to see all your applications. You can update status (Applied, Interview, Offer, Rejected) from there.";
    }
    else if (messageLower.includes("resume") || messageLower.includes("upload")) {
      replyMessage = "📄 You can paste your resume in the text area or click 'Choose File' to upload a PDF or TXT file. Then click 'Save Resume' to store it for AI matching.";
    }
    else if (messageLower.includes("match") || messageLower.includes("score")) {
      replyMessage = "🎯 Match scores (0-100%) show how well your resume skills match the job requirements:\n• Green (>70%) = High match\n• Yellow (40-70%) = Medium match\n• Gray (<40%) = Low match";
    }
    else if (messageLower.includes("job") || messageLower.includes("work")) {
      replyMessage = "🔍 I can help you find jobs! Try asking:\n• 'Show remote jobs'\n• 'Find hybrid positions'\n• 'Full-time jobs'\n• 'Contract jobs'";
    }
    else {
      replyMessage = "💬 I'm your AI Job Assistant! I can help you find jobs. Try asking:\n\n• 'Show remote jobs'\n• 'Find hybrid positions'\n• 'Full-time jobs'\n• 'Contract jobs'\n• 'High match scores'\n• 'Clear all filters'";
    }
    
    console.log(`🤖 AI Chat - Query: "${message}" -> Filter: ${filter || "none"}`);
    
    return reply.send({
      reply: replyMessage,
      filter: filter
    });
    
  } catch (err) {
    console.error("❌ Chat error:", err);
    return reply.status(500).send({ 
      reply: "Sorry, I encountered an error. Please try again.",
      filter: null
    });
  }
});

// ============================================
// APPLICATIONS ENDPOINTS
// ============================================
app.post("/apply", async (req, reply) => {
  const application = {
    id: applications.length + 1,
    ...req.body,
    status: "Applied",
    appliedDate: new Date().toISOString()
  };
  
  applications.push(application);
  console.log(`✅ Application saved: ${application.jobTitle} for ${application.email}`);
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
  application.updatedAt = new Date().toISOString();
  
  console.log(`📝 Application ${id} status updated to: ${status}`);
  return reply.send({ success: true, application });
});

app.get("/applications", async (req, reply) => {
  const { email } = req.query;
  if (email) {
    return reply.send(applications.filter(a => a.email === email));
  }
  return reply.send(applications);
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
    console.log(`🤖 AI Chat Assistant: Active`);
    console.log(`🔍 Remote jobs detection: Active`);
    console.log("=".repeat(60));
    console.log("\n✅ AI Chat Commands:");
    console.log("   • 'remote jobs' → Shows remote jobs");
    console.log("   • 'hybrid jobs' → Shows hybrid jobs");
    console.log("   • 'full-time jobs' → Shows full-time jobs");
    console.log("   • 'contract jobs' → Shows contract jobs");
    console.log("   • 'clear filters' → Resets all filters");
    console.log("\n📝 Test Credentials:");
    console.log("   Email: test@gmail.com");
    console.log("   Password: test@123");
    console.log("\n");
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();