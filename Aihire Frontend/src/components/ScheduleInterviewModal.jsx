import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiVideo, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { interviewService } from '../services/api';
import { useToast } from './Toast';

const ScheduleInterviewModal = ({ applicant, isOpen, onClose, onScheduleSuccess }) => {
  const { showToast } = useToast();
  const [type, setType] = useState('Online'); // Online or Offline
  const [dateTime, setDateTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !applicant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateTime) {
      setError('Please select a date and time.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        applicantId: applicant.id,
        candidateName: applicant.candidateName,
        candidateEmail: applicant.candidateEmail,
        jobTitle: applicant.jobTitle,
        type,
        dateTime
      };

      await interviewService.scheduleInterview(payload);
      showToast(`Interview scheduled with ${applicant.candidateName}!`, 'success');
      if (onScheduleSuccess) onScheduleSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">Schedule Interview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-schedule-modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Candidate Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate</p>
            <h4 className="text-sm font-bold text-slate-800">{applicant.candidateName}</h4>
            <p className="text-xs text-slate-500">{applicant.candidateEmail}</p>
            <div className="mt-2 pt-2 border-t border-slate-200/60">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Position</p>
              <p className="text-xs font-semibold text-slate-700">{applicant.jobTitle}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {error}
            </div>
          )}

          {/* Interview Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interview Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('Online')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all duration-150 ${
                  type === 'Online'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="type-online-btn"
              >
                <FiVideo className="w-4 h-4" />
                <span>Online Meeting</span>
              </button>

              <button
                type="button"
                onClick={() => setType('Offline')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all duration-150 ${
                  type === 'Offline'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="type-offline-btn"
              >
                <FiMapPin className="w-4 h-4" />
                <span>On-Site (Offline)</span>
              </button>
            </div>
          </div>

          {/* Date and Time Selector */}
          <div>
            <label htmlFor="interview-time" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Date &amp; Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="interview-time"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
              <FiClock className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-150"
              id="confirm-schedule-btn"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Confirm Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
