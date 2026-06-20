import React from 'react';
import { FiMapPin, FiDollarSign, FiCpu, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';

const JobCard = ({ job, userRole, hasApplied, isApplying, onApply, onEdit, onDelete }) => {
  const matchScore = job.matchScore !== undefined ? job.matchScore : 50;

  // Color selection based on Match Percentage
  const getMatchScoreStyles = (score) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        bar: 'bg-emerald-500',
        text: 'Highly Recommended'
      };
    } else if (score >= 50) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-700',
        bar: 'bg-amber-500',
        text: 'Moderate Match'
      };
    } else {
      return {
        bg: 'bg-slate-50 border-slate-200 text-slate-600',
        bar: 'bg-slate-400',
        text: 'Potential Match'
      };
    }
  };

  const scoreStyles = getMatchScoreStyles(matchScore);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group">
      
      {/* Top Section: Role & AI Match */}
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-150">
              {job.title}
            </h3>
            <p className="text-sm font-semibold text-slate-500">{job.company}</p>
          </div>
          
          {/* AI Match Badge */}
          {userRole === 'jobseeker' && (
            <div className={`flex flex-col items-end shrink-0`}>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${scoreStyles.bg}`}>
                <FiCpu className="w-3.5 h-3.5" />
                <span>{matchScore}% Match</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">{scoreStyles.text}</span>
            </div>
          )}
        </div>

        {/* Location & Salary Info */}
        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <FiMapPin className="text-slate-400 w-4 h-4" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-1.5">
              <FiDollarSign className="text-slate-400 w-4 h-4" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5">
          {job.description}
        </p>

        {/* Tech Stack / Skills Required */}
        <div className="mb-6">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 font-medium border border-slate-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Seeker View: AI Recommendation Fit Indicator Bar */}
      {userRole === 'jobseeker' && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-5">
          <div className={`h-full ${scoreStyles.bar}`} style={{ width: `${matchScore}%` }} />
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>

        {userRole === 'jobseeker' ? (
          <button
            onClick={() => onApply(job.id)}
            disabled={hasApplied || isApplying}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 focus:outline-none ${
              hasApplied
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
            }`}
            id={`apply-btn-${job.id}`}
          >
            {isApplying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Applying...</span>
              </>
            ) : hasApplied ? (
              <>
                <FiCheck className="w-4 h-4 text-slate-400" />
                <span>Applied</span>
              </>
            ) : (
              <span>Apply Now</span>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(job)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              title="Edit Job"
              id={`edit-job-${job.id}`}
            >
              <FiEdit2 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150"
              title="Delete Job"
              id={`delete-job-${job.id}`}
            >
              <FiTrash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
