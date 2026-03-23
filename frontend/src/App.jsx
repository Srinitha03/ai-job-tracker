import { useEffect, useState } from "react";
import "./App.css";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState("");
  const [matchScores, setMatchScores] = useState({});
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [showApplyPopup, setShowApplyPopup] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Filters
  const [titleFilter, setTitleFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [matchScoreFilter, setMatchScoreFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState([]);
  
  const allSkills = ["React", "Python", "Node.js", "JavaScript", "TypeScript", "AWS", "Docker", "SQL"];

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      fetchJobs();
      fetchUserResume(userData.email);
      fetchApplications(userData.email);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        fetchJobs();
        fetchUserResume(email);
        fetchApplications(email);
      } else {
        setAuthError("Invalid credentials");
      }
    } catch (err) {
      setAuthError("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsLogin(true);
        setAuthError("Registration successful! Please login.");
      } else {
        setAuthError(data.message);
      }
    } catch (err) {
      setAuthError("Registration failed");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/jobs");
      const data = await res.json();
      setJobs(data);
      setFilteredJobs(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setLoading(false);
    }
  };

  const fetchUserResume = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/resume?email=${email}`);
      const data = await res.json();
      if (data.resume) {
        setResume(data.resume);
        calculateMatchScores(data.resume);
      }
    } catch (err) {
      console.error("Error fetching resume:", err);
    }
  };

  const calculateMatchScores = async (resumeText) => {
    const scores = {};
    
    for (const job of jobs) {
      try {
        const res = await fetch("http://localhost:5000/ai-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeText, job })
        });
        const data = await res.json();
        scores[job.id] = data.score || 0;
      } catch (err) {
        scores[job.id] = 0;
      }
    }
    
    setMatchScores(scores);
  };

  const fetchApplications = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/applications?email=${email}`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const handleSaveResume = async () => {
    try {
      await fetch("http://localhost:5000/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, resume })
      });
      alert("Resume saved!");
      calculateMatchScores(resume);
    } catch (err) {
      alert("Error saving resume");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => setResume(event.target.result);
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
          fullText += content.items.map(item => item.str).join(" ");
        }
        setResume(fullText);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Only PDF or TXT supported");
    }
  };

  const handleApply = (job) => {
    window.open(job.link, "_blank");
    setShowApplyPopup(job);
  };

  const confirmApplication = async (applied, job) => {
    if (applied === "yes") {
      try {
        await fetch("http://localhost:5000/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            mode: job.mode
          })
        });
        alert(`Applied to ${job.title} successfully!`);
        fetchApplications(user.email);
      } catch (err) {
        alert("Error saving application");
      }
    }
    setShowApplyPopup(null);
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await fetch(`http://localhost:5000/apply/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchApplications(user.email);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];
    
    if (titleFilter) {
      filtered = filtered.filter(j => j.title.toLowerCase().includes(titleFilter.toLowerCase()));
    }
    
    if (jobTypeFilter) {
      filtered = filtered.filter(j => j.type === jobTypeFilter);
    }
    
    if (modeFilter) {
      filtered = filtered.filter(j => j.mode === modeFilter);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(j => 
        j.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        j.country.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    if (dateRangeFilter) {
      const now = new Date();
      const days = parseInt(dateRangeFilter);
      const cutoff = new Date(now.setDate(now.getDate() - days));
      filtered = filtered.filter(j => new Date(j.postedDate) >= cutoff);
    }
    
    if (matchScoreFilter) {
      filtered = filtered.filter(j => {
        const score = matchScores[j.id] || 0;
        if (matchScoreFilter === "high") return score > 70;
        if (matchScoreFilter === "medium") return score >= 40 && score <= 70;
        return true;
      });
    }
    
    if (skillsFilter.length > 0) {
      filtered = filtered.filter(j => 
        skillsFilter.some(skill => 
          j.skills.some(js => js.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }
    
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    if (jobs.length > 0) applyFilters();
  }, [titleFilter, jobTypeFilter, modeFilter, locationFilter, dateRangeFilter, matchScoreFilter, skillsFilter, matchScores]);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    
    setChatLoading(true);
    
    try {
      const res = await fetch("http://localhost:5000/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatMessage })
      });
      
      const data = await res.json();
      setChatResponse(data.reply);
      
      // Apply filters from AI
      if (data.filters) {
        if (data.filters.mode) setModeFilter(data.filters.mode);
        if (data.filters.type) setJobTypeFilter(data.filters.type);
        if (data.filters.title) setTitleFilter(data.filters.title);
        if (data.filters.location) setLocationFilter(data.filters.location);
        if (data.filters.matchScore) setMatchScoreFilter(data.filters.matchScore);
        if (data.filters.dateRange) setDateRangeFilter(data.filters.dateRange);
      }
      
      setChatMessage("");
    } catch (err) {
      setChatResponse("Sorry, I encountered an error. Please try again.");
    }
    
    setChatLoading(false);
  };

  const getMatchColor = (score) => {
    if (score > 70) return "match-high";
    if (score >= 40) return "match-medium";
    return "match-low";
  };

  const bestMatches = [...jobs]
    .map(job => ({ ...job, score: matchScores[job.id] || 0 }))
    .filter(job => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🎯 AI Job Tracker</h1>
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authError && <p className="error">{authError}</p>}
            <button type="submit">{isLogin ? "Login" : "Register"}</button>
          </form>
          <p onClick={() => setIsLogin(!isLogin)} className="switch-auth">
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </p>
          <div className="test-credentials">
            <p>Test Credentials:</p>
            <p>Email: test@gmail.com</p>
            <p>Password: test@123</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>🎯 AI Job Tracker</h1>
          <p>Welcome, {user?.email}</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => setShowApplications(!showApplications)}>
            {showApplications ? "📋 Browse Jobs" : "📊 My Applications"} ({applications.length})
          </button>
          <button onClick={() => {
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Resume Section */}
      <div className="resume-section">
        <h3>📄 Your Resume</h3>
        <textarea
          placeholder="Paste your resume here or upload a file..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows="4"
        />
        <div className="resume-actions">
          <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} />
          <button onClick={handleSaveResume}>💾 Save Resume</button>
        </div>
      </div>

      {showApplications ? (
        // Applications Dashboard
        <div className="applications-section">
          <div className="applications-header">
            <h2>📋 My Job Applications</h2>
            <button onClick={() => setShowApplications(false)} className="back-btn">
              ← Back to Jobs
            </button>
          </div>
          {applications.length === 0 ? (
            <div className="no-jobs">
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
                  {app.timeline && (
                    <div className="app-timeline">
                      <small>Timeline:</small>
                      {app.timeline.map((t, i) => (
                        <div key={i}>• {t.status} on {new Date(t.date).toLocaleDateString()}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Best Matches Section */}
          {resume && bestMatches.length > 0 && (
            <>
              <h2>⭐ Best Matches for You</h2>
              <div className="job-container">
                {bestMatches.map((job) => (
                  <div key={job.id} className="job-card">
                    <h3>{job.title}</h3>
                    <p><b>{job.company}</b></p>
                    <p>📍 {job.location}</p>
                    <p className="desc">{job.description}</p>
                    <div className="job-badges">
                      <span className="badge">{job.type}</span>
                      <span className="badge">{job.mode}</span>
                    </div>
                    <p className={getMatchColor(job.score)}>
                      Match: {job.score}%
                    </p>
                    <button className="apply-btn" onClick={() => handleApply(job)}>
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Filters Section */}
          <div className="filters-section">
            <h2>🔍 Filter Jobs</h2>
            <div className="filter-grid">
              <input
                type="text"
                placeholder="Job title..."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
              
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              
              <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
              
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <option value="">All Modes</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
              
              <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
                <option value="">Any Time</option>
                <option value="1">Last 24 Hours</option>
                <option value="7">Last Week</option>
                <option value="30">Last Month</option>
              </select>
              
              <select value={matchScoreFilter} onChange={(e) => setMatchScoreFilter(e.target.value)}>
                <option value="">All Scores</option>
                <option value="high">High Match (&gt;70%)</option>
                <option value="medium">Medium Match (40-70%)</option>
              </select>
              
              <div className="skills-filter">
                <label>Skills:</label>
                <div className="skills-checkboxes">
                  {allSkills.map(skill => (
                    <label key={skill}>
                      <input
                        type="checkbox"
                        value={skill}
                        checked={skillsFilter.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSkillsFilter([...skillsFilter, skill]);
                          } else {
                            setSkillsFilter(skillsFilter.filter(s => s !== skill));
                          }
                        }}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="filter-stats">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>

          {/* All Jobs */}
          <h2>📋 All Jobs</h2>
          <div className="job-container">
            {filteredJobs.map((job) => {
              const score = matchScores[job.id] || 0;
              return (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p><b>{job.company}</b></p>
                  <p>📍 {job.location}</p>
                  <p className="desc">{job.description}</p>
                  <div className="job-badges">
                    <span className="badge">{job.type}</span>
                    <span className="badge">{job.mode}</span>
                  </div>
                  <div className="job-skills">
                    {job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills.length > 3 && <span>+{job.skills.length - 3}</span>}
                  </div>
                  <p className={getMatchColor(score)}>
                    Match: {score}%
                  </p>
                  <button className="apply-btn" onClick={() => handleApply(job)}>
                    Apply Now
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Apply Popup */}
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

      {/* AI Chat Assistant */}
      <div className="chat-container">
        {!chatOpen && (
          <button className="chat-toggle" onClick={() => setChatOpen(true)}>
            💬
          </button>
        )}
        
        {chatOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h4>🤖 AI Assistant</h4>
              <button onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div className="chat-messages">
              {chatResponse && (
                <div className="chat-message bot">
                  <p>{chatResponse}</p>
                </div>
              )}
              {chatLoading && <p className="chat-loading">Thinking...</p>}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask me anything... (e.g., 'Show remote jobs', 'Filter by last 24 hours')"
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              />
              <button onClick={handleChat}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;