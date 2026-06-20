import React from 'react';
import { FiFileText, FiCpu, FiCheck, FiX, FiCalendar, FiUserCheck } from 'react-icons/fi';

const ApplicantCard = ({ applicant, onStatusUpdate, onScheduleInterview }) => {
  const { id, candidateName, candidateEmail, skills, resumeName, status, matchScore, jobTitle } = applicant;

  // Determine badge colors based on recruitment stage
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shortlisted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Applied':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Determine color matching for the gauge
  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Applying for</span>
          <h4 className="text-md font-bold text-slate-900 mb-0.5">{jobTitle}</h4>
          <h3 className="text-lg font-bold text-slate-800">{candidateName}</h3>
          <p className="text-xs text-slate-500 font-medium">{candidateEmail}</p>
        </div>

        {/* AI Score Badge & Current Status */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getMatchScoreColor(matchScore)}`}>
            <FiCpu className="w-3.5 h-3.5" />
            <span>{matchScore}% AI Score</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyles(status)}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Candidate Skills Grid */}
      <div className="mb-4">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Candidate Skills</span>
        <div className="flex flex-wrap gap-1">
          {skills && skills.length > 0 ? (
            skills.map((skill, index) => (
              <span
                key={index}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100 font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No skills listed</span>
          )}
        </div>
      </div>

      {/* Resume Section */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <FiFileText className="text-blue-500 w-5 h-5 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-700 truncate">Resume Document</p>
            <p className="text-[10px] text-slate-400 truncate">{resumeName || 'No resume uploaded'}</p>
          </div>
        </div>
        {resumeName && (
          <a
            href={`#download-resume-${id}`}
            onClick={(e) => {
              e.preventDefault();
              alert(`Simulating resume download: ${resumeName}`);
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-2.5 py-1 rounded-lg hover:bg-blue-50/50 shrink-0"
            id={`resume-download-${id}`}
          >
            Open File
          </a>
        )}
      </div>

      {/* Actions Row */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Interview Scheduler */}
        {status !== 'Rejected' && status !== 'Hired' && (
          <button
            onClick={() => onScheduleInterview(applicant)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-150"
            id={`schedule-int-btn-${id}`}
          >
            <FiCalendar className="w-4 h-4" />
            <span>Schedule Interview</span>
          </button>
        )}

        {/* Workflow actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {status !== 'Rejected' && status !== 'Hired' && (
            <button
              onClick={() => onStatusUpdate(id, 'Rejected')}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150"
              title="Reject Candidate"
              id={`reject-btn-${id}`}
            >
              <FiX className="w-4.5 h-4.5 text-rose-500" />
            </button>
          )}
          {status !== 'Under Review' && status !== 'Hired' && status !== 'Rejected' && (
            <button
              onClick={() => onStatusUpdate(id, 'Under Review')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-150"
              title="Set to Under Review"
              id={`review-btn-${id}`}
            >
              <span>Review</span>
            </button>
          )}
          {status !== 'Shortlisted' && status !== 'Hired' && status !== 'Rejected' && (
            <button
              onClick={() => onStatusUpdate(id, 'Shortlisted')}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
              title="Shortlist Candidate"
              id={`shortlist-btn-${id}`}
            >
              <FiCheck className="w-4.5 h-4.5 text-indigo-500" />
            </button>
          )}
          {status !== 'Hired' && status !== 'Rejected' && (
            <button
              onClick={() => onStatusUpdate(id, 'Hired')}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all duration-150"
              title="Hire Candidate"
              id={`hire-btn-${id}`}
            >
              <FiUserCheck className="w-3.5 h-3.5" />
              <span>Hire</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantCard;
