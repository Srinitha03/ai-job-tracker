import React from "react";

const JobCard = ({ job, onApply }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
      
      <h2 className="text-xl font-semibold text-gray-800">
        {job.title}
      </h2>

      <p className="text-gray-600 mt-1">
        {job.company}
      </p>

      {/* ✅ FIXED THIS PART */}
      <p className="text-gray-500 mt-2 text-sm">
        {job.type} • {job.mode}
      </p>

      {/* ✅ FIXED SKILLS */}
      <p className="text-gray-500 text-sm">
        {job.skills?.slice(0, 2).join(", ")}
        {job.skills?.length > 2 && ` +${job.skills.length - 2}`}
      </p>

      {/* Match score */}
      {job.matchScore !== undefined && (
        <p className="text-sm font-medium text-purple-600 mt-2">
          Match: {job.matchScore}%
        </p>
      )}

      <button
        onClick={() => onApply(job)}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Apply Now
      </button>
    </div>
  );
};

export default JobCard;