import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/jobs")
      .then((res) => res.json())
      .then((data) => {
        const jobIndex = parseInt(id);
        setJob(data[jobIndex]);
      });
  }, [id]);

  console.log(job);
  console.log("ID:", id);
  console.log("JOB:", job);

  // ✅ FUNCTION TO SAVE DATA
  const handleApply = (status) => {
    fetch("http://localhost:5000/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        status: status,
      }),
    });

    setShowPopup(false);
  };

  if (!job) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>{job.title}</h1>
      <h3>{job.company}</h3>
      <p>{job.location}</p>

      <p><b>Description:</b> {job.description}</p>
      <p><b>Skills:</b> {job.skills.join(", ")}</p>
      <p><b>Type:</b> {job.type}</p>
      <p><b>Mode:</b> {job.mode}</p>

      {/* ✅ UPDATED APPLY BUTTON */}
      <button
        onClick={() => {
          window.open(job.link, "_blank");
          setShowPopup(true);
        }}
      >
        Apply Now
      </button>

      {/* ✅ POPUP UI */}
      {showPopup && (
        <div style={{
          position: "fixed",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          textAlign: "center"
        }}>
          <p>
            Did you apply to <b>{job.title}</b> at <b>{job.company}</b>?
          </p>

          <button onClick={() => handleApply("Applied")}>
            Yes, Applied
          </button>

          <br /><br />

          <button onClick={() => handleApply("Browsing")}>
            No, just browsing
          </button>

          <br /><br />

          <button onClick={() => handleApply("Earlier")}>
            Applied Earlier
          </button>
        </div>
      )}
    </div>
  );
}

export default JobDetails;