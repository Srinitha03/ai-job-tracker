import { useEffect, useState } from "react";

function Applications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/applications")
      .then((res) => res.json())
      .then((data) => setApps(data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Applications</h1>

      {apps.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        apps.map((app, index) => (
          <div key={index} className="app-card">
            <h3>{app.title}</h3>
            <p><b>Company:</b> {app.company}</p>
            <p><b>Status:</b></p>
            <select
  value={app.status}
 onChange={(e) =>
  fetch("http://localhost:5000/update-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      index,
      status: e.target.value,
    }),
  })
}
>
  <option>Applied</option>
  <option>Interview</option>
  <option>Offer</option>
  <option>Rejected</option>
</select>
            <p><b>Applied On:</b> {new Date(app.timestamp).toLocaleString()}</p>
            <p><b>Timeline:</b></p>
<ul>
  <li>Applied ✔</li>
  {app.status === "Interview" && <li>Interview ✔</li>}
  {app.status === "Offer" && <li>Offer 🎉</li>}
  {app.status === "Rejected" && <li>Rejected ❌</li>}
</ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Applications;