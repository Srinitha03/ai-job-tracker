import { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";

// ✅ PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [mode, setMode] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [resume, setResume] = useState("");
  const [resumeSearch, setResumeSearch] = useState(false);
  const [aiResults, setAiResults] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [aiFilter, setAiFilter] = useState(null);
  const [workMode, setWorkMode] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matchScores, setMatchScores] = useState({});
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [showApplyPopup, setShowApplyPopup] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user && window.location.pathname !== "/login") {
      navigate("/login");
    }
  }, []);

  // ✅ FETCH JOBS
  useEffect(() => {
    fetch("https://ai-job-tracker-backend-o857.onrender.com/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  // ✅ Calculate match scores for all jobs
  useEffect(() => {
    if (resume && jobs.length > 0) {
      calculateAllMatchScores();
    }
  }, [resume, jobs]);

  const calculateAllMatchScores = async () => {
    const scores = {};
    for (let job of jobs) {
      const score = await calculateScoreWithAI(job);
      scores[job.id] = score;
    }
    setMatchScores(scores);
  };

  const calculateScoreWithAI = async (job) => {
    try {
      const res = await fetch("https://ai-job-tracker-backend-o857.onrender.com/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, job })
      });
      const data = await res.json();
      return data.score || 0;
    } catch (err) {
      return calculateScore(job);
    }
  };

  // ✅ LOAD USER RESUME
  useEffect(() => {
    const email = localStorage.getItem("user");
    if (!email) return;

    fetch("https://ai-job-tracker-backend-o857.onrender.com0/resume?email=" + email)
      .then((res) => res.json())
      .then((data) => {
        if (data.resume) {
          setResume(data.resume);
        }
      });
    
    fetchApplications(email);
  }, []);

  const fetchApplications = async (email) => {
    try {
      const res = await fetch(`https://ai-job-tracker-backend-o857.onrender.com/applications?email=${email}`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  // ✅ SAVE RESUME
  const saveResume = async () => {
    const email = localStorage.getItem("user");
    await fetch("https://ai-job-tracker-backend-o857.onrender.com/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resume }),
    });
    alert("Resume saved!");
    calculateAllMatchScores();
  };

  // ✅ FILE UPLOAD (TXT + PDF)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResume(event.target.result);
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          fullText += strings.join(" ");
        }
        setResume(fullText);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Only PDF or TXT supported");
    }
  };

  const handleApply = (job) => {
    window.open(job.link || job.applyLink, "_blank");
    setShowApplyPopup(job);
  };

  const confirmApplication = async (applied, job) => {
    const email = localStorage.getItem("user");
    if (applied === "yes") {
      try {
        await fetch("https://ai-job-tracker-backend-o857.onrender.com/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            mode: job.mode
          })
        });
        alert(`Applied to ${job.title} successfully!`);
        fetchApplications(email);
      } catch (err) {
        alert("Error saving application");
      }
    }
    setShowApplyPopup(null);
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await fetch(`https://ai-job-tracker-backend-o857.onrender.com/apply/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const email = localStorage.getItem("user");
      fetchApplications(email);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ✅ MATCH SCORE
  const calculateScore = (job) => {
    if (!resume) return 0;
    const resumeText = resume.toLowerCase();
    let match = 0;
    job.skills.forEach((skill) => {
      if (resumeText.includes(skill.toLowerCase())) match++;
    });
    return Math.round((match / job.skills.length) * 100);
  };

  // ✅ FILTER JOBS
  const filteredJobs = jobs.filter((job) => {
    const score = matchScores[job.id] || calculateScore(job);
    return (
      job.title.toLowerCase().includes(search.toLowerCase()) &&
      (jobType === "" || job.type === jobType) &&
      (mode === "" || job.mode === mode) &&
      (scoreFilter === "" ||
        (scoreFilter === "high" && score > 70) ||
        (scoreFilter === "medium" && score >= 40 && score <= 70))
    );
  });

  // ✅ BEST MATCHES
  const bestMatches = [...jobs]
    .map((job) => ({
      ...job,
      score: matchScores[job.id] || calculateScore(job),
    }))
    .filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const sendMessage = async () => {
  if (!message.trim()) return;
  
  setLoading(true);
  setChatResponse("");

  try {
    const res = await fetch("https://ai-job-tracker-backend-o857.onrender.com/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    console.log("AI RESPONSE:", data);
    setChatResponse(data.reply);

    // ✅ Apply filters from AI
    if (data.filters) {
      if (data.filters.mode === "Remote") setMode("Remote");
      if (data.filters.mode === "Hybrid") setMode("Hybrid");
      if (data.filters.mode === "On-site") setMode("On-site");
      if (data.filters.type) setJobType(data.filters.type);
      if (data.filters.title) setSearch(data.filters.title);
      if (data.filters.matchScore === "high") setScoreFilter("high");
      if (data.filters.matchScore === "medium") setScoreFilter("medium");
      
      // ✅ Enable resume search to show filtered jobs
      setResumeSearch(false);
    }
    
    // ✅ Handle direct filter responses
    if (data.filter === "remote") {
      setMode("Remote");
      setResumeSearch(false);
    }
    if (data.filter === "hybrid") {
      setMode("Hybrid");
      setResumeSearch(false);
    }
    if (data.filter === "onsite") {
      setMode("On-site");
      setResumeSearch(false);
    }
    if (data.filter === "high_match") {
      setScoreFilter("high");
      setResumeSearch(false);
    }
    if (data.filter === "all") {
      setMode("");
      setJobType("");
      setScoreFilter("");
      setSearch("");
      setResumeSearch(false);
    }

    setMessage("");
  } catch (err) {
    console.error("Chat error:", err);
    setChatResponse("Sorry, I encountered an error. Please try again.");
  }
  
  setLoading(false);
};

  const getMatchColor = (score) => {
    if (score > 70) return "match-high";
    if (score >= 40) return "match-medium";
    return "match-low";
  };

  return (
    <div className="container">
      {/* HEADER with View Applications and Logout on TOP RIGHT */}
      <div className="header">
        <div className="header-left">
          <h1> AI Job Tracker</h1>
          <p className="header-subtitle">AI-powered job matching based on resume analysis</p>
        </div>
        <div className="header-right">
          <button 
            className="view-apps-btn"
            onClick={() => setShowApplications(!showApplications)}
          >
            {showApplications ? "← Browse Jobs" : ` View Applications (${applications.length})`}
          </button>
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
             Logout
          </button>
        </div>
      </div>

      {/* RESUME SECTION */}
      <div className="resume-section">
        <h3> Your Resume</h3>
        <textarea
          placeholder="Paste your resume here or upload a file..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows="5"
        />
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileUpload}
        />

        <div className="resume-buttons">
          <button onClick={saveResume}> Save Resume</button>
          <button onClick={() => setResumeSearch(true)}> Find Matching Jobs</button>
          <button onClick={() => {
            setResumeSearch(false);
            setMode("");
            setJobType("");
            setScoreFilter("");
            setSearch("");
          }}>Show All Jobs</button>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search jobs by title or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filters">
          <select onChange={(e) => setJobType(e.target.value)} value={jobType}>
            <option value="">All Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
          <select onChange={(e) => setMode(e.target.value)} value={mode}>
            <option value="">Work Mode</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>
          <select onChange={(e) => setScoreFilter(e.target.value)} value={scoreFilter}>
            <option value="">Match Score</option>
            <option value="high">High (&gt;70%)</option>
            <option value="medium">Medium (40-70%)</option>
          </select>
        </div>
      </div>

      {showApplications ? (
        // APPLICATIONS DASHBOARD
        <div className="applications-section">
          <h2> My Job Applications</h2>
          {applications.length === 0 ? (
            <div className="no-applications">
              <p>No applications yet. Start applying to jobs!</p>
            </div>
          ) : (
            <div className="applications-list">
              {applications.map((app) => (
                <div key={app.id} className="app-card">
                  <h3>{app.jobTitle}</h3>
                  <p><b>{app.company}</b> • {app.location}</p>
                  <p>{app.type} • {app.mode}</p>
                  <div className="app-status">
                    Status: 
                    <select 
                      value={app.status} 
                      onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                    >
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Offer</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <p className="app-date">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* MESSAGE */}
          {resumeSearch && (
            <h3 className="search-message">🔍 Showing jobs matching your resume</h3>
          )}
          
          {/* BEST MATCHES */}
          {resumeSearch && bestMatches.length > 0 && (
            <>
              <h2>⭐ Best Matches for You</h2>
              <div className="job-container">
                {bestMatches.map((job, index) => {
                  const score = matchScores[job.id] || calculateScore(job);
                  return (
                    <div key={index} className="job-card">
                      <h3>{job.title}</h3>
                      <p className="company">{job.company}</p>
                      <p className="location">📍 {job.location}</p>
                      <p className="desc">{job.description}</p>
                      <div className="job-badges">
                        <p className="job-type-mode">
  {job.type} • {job.mode}
</p>
                      </div>
                      <p className={getMatchColor(score)}>
                        Match: {score}%
                      </p>
                      <button
                        className="apply-btn"
                        onClick={() => handleApply(job)}
                      >
                        Apply Now
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* NO MATCH MESSAGE */}
          {resumeSearch && bestMatches.length === 0 && (
            <h3 className="no-match">❌ No matching jobs found. Try uploading a more detailed resume.</h3>
          )}

          {/* ALL JOBS */}
          <h2>AI Recommended Jobs/ALL Jobs</h2>
          <div className="job-container">
            {filteredJobs.length === 0 && (
              <div className="no-jobs">
                <p>❌ No jobs found</p>
              </div>
            )}

            {filteredJobs.map((job, index) => {
              const score = matchScores[job.id] || calculateScore(job);
              return (
                <div key={index} className="job-card">
                  <h3>{job.title}</h3>
                  <p className="company">{job.company}</p>
                  <p className="location">📍 {job.location}</p>
                  <p className="desc">{job.description}</p>
                  <div className="job-badges">
                    <p className="job-type-mode">
  {job.type} • {job.mode}
</p>
                  </div>
                  <div className="job-skills">
                    {job.skills && job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills && job.skills.length > 3 && <span className="skill-tag">+{job.skills.length - 3}</span>}
                  </div>
                  <p className={getMatchColor(score)}>
                    Match: {score}%
                  </p>
                  <button
                    className="apply-btn"
                    onClick={() => handleApply(job)}
                  >
                    Apply Now
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* APPLY POPUP */}
      {showApplyPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Did you apply to {showApplyPopup.title} at {showApplyPopup.company}?</h3>
            <div className="popup-buttons">
              <button onClick={() => confirmApplication("yes", showApplyPopup)}>✅ Yes, Applied</button>
              <button onClick={() => confirmApplication("no", showApplyPopup)}>❌ No, just browsing</button>
              <button onClick={() => confirmApplication("earlier", showApplyPopup)}>📅 Applied Earlier</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ADD CHAT HERE */}
<div style={{
  position: "fixed",
  bottom: 20,
  right: 20
}}>
  {!chatOpen && (
    <button onClick={() => setChatOpen(true)}>
      💬 AI
    </button>
  )}

  {chatOpen && (
    <div style={{
      background: "white",
      padding: 10,
      width: 300,
      borderRadius: 10,
      boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }}>
      <h4>AI Assistant</h4>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask jobs..."
      />

      <button onClick={sendMessage}>Send</button>
      {loading && <p> Thinking...</p>}


      <p><b>AI:</b> {chatResponse}</p>

      <button onClick={() => setChatOpen(false)}>Close</button>
    </div>
        )}
      </div>
    </div>
  );
}

export default App;