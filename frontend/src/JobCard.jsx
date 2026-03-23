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

      <div className="flex gap-2 mt-3 flex-wrap">
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
          {job.type}
        </span>

        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
          {job.location}
        </span>

        {job.matchScore && (
          <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
            Match: {job.matchScore}%
          </span>
        )}
      </div>

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