import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import JobDetails from "./JobDetails.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Applications from "./Applications.jsx";
import Login from "./Login.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<App />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/applications" element={<Applications />} />
    </Routes>
  </BrowserRouter>
); 