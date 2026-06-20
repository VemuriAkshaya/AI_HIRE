import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { jobService, applicationService, interviewService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import ApplicantCard from '../components/ApplicantCard';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import { 
  FiBriefcase, FiPlusCircle, FiUsers, FiCalendar, 
  FiMapPin, FiDollarSign, FiAlignLeft, FiCpu, 
  FiFileText, FiTrash2, FiEdit2, FiX, FiCheckCircle,
  FiVideo, FiInfo
} from 'react-icons/fi';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setTab] = useState('manage'); // manage, post, applicants, interviews

  // Posted Jobs lists
  const [myJobs, setMyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Applicants lists
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // Scheduled Interviews lists
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  // Modal / Form state for job creation/editing
  const [editingJob, setEditingJob] = useState(null); // When set, show Edit Modal
  const [editForm, setEditForm] = useState({ title: '', location: '', salary: '', skills: '', description: '' });
  
  // Job Post form fields
  const [postForm, setPostForm] = useState({ title: '', location: '', salary: '', skills: '', description: '' });
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(false);

  // Schedule interview states
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const loadAllRecruiterData = async () => {
    if (!user) return;
    setJobsLoading(true);
    setApplicantsLoading(true);
    setInterviewsLoading(true);

    try {
      // Load recruiter's posted jobs
      const jobs = await jobService.getJobs();
      const recruiterJobs = jobs.filter(j => j.recruiterId === user.email);
      setMyJobs(recruiterJobs);

      // Load applicants
      const apps = await applicationService.getApplications();
      setApplicants(apps);

      // Load interview schedule
      const ints = await interviewService.getScheduledInterviews();
      setInterviews(ints);
    } catch (err) {
      showToast('Error loading dashboard data', 'error');
    } finally {
      setJobsLoading(false);
      setApplicantsLoading(false);
      setInterviewsLoading(false);
    }
  };

  useEffect(() => {
    loadAllRecruiterData();
  }, [user]);

  // Submit new Job
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.location || !postForm.skills || !postForm.description) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setPosting(true);
    try {
      await jobService.postJob({
        ...postForm,
        company: user.name // Set the company name as recruiter's registration name
      });
      showToast('Job position posted successfully!', 'success');
      setPostForm({ title: '', location: '', salary: '', skills: '', description: '' });
      loadAllRecruiterData();
      setTab('manage'); // Switch back to list view
    } catch (err) {
      showToast('Failed to post job listing', 'error');
    } finally {
      setPosting(false);
    }
  };

  // Open Edit Mode
  const openEditModal = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      location: job.location,
      salary: job.salary,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
      description: job.description
    });
  };

  // Submit edit
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.location || !editForm.skills || !editForm.description) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setEditing(true);
    try {
      await jobService.updateJob(editingJob.id, editForm);
      showToast('Job posting updated successfully', 'success');
      setEditingJob(null);
      loadAllRecruiterData();
    } catch (err) {
      showToast('Failed to update job posting', 'error');
    } finally {
      setEditing(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting? This will also remove any applicant records associated with it.')) {
      try {
        await jobService.deleteJob(id);
        showToast('Job listing deleted successfully', 'info');
        loadAllRecruiterData();
      } catch (err) {
        showToast('Failed to delete job', 'error');
      }
    }
  };

  // Update application lifecycle
  const handleApplicantStatus = async (applicationId, status) => {
    try {
      await applicationService.updateApplicantStatus(applicationId, status);
      showToast(`Candidate status marked as ${status}!`, 'success');
      loadAllRecruiterData(); // Refresh list
    } catch (err) {
      showToast('Failed to update candidate status', 'error');
    }
  };

  const triggerInterviewScheduler = (applicant) => {
    setSelectedApplicant(applicant);
    setScheduleModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Core Layout Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-sm">
              <div>
                <h1 className="text-2xl font-bold">Recruiter Command Center</h1>
                <p className="text-sm text-slate-400">Post roles, analyze applicant match metrics, and organize interviews.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700/50">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Posted Positions</span>
                  <span className="text-lg font-extrabold text-teal-400">{myJobs.length} Live</span>
                </div>
                <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700/50">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Candidates</span>
                  <span className="text-lg font-extrabold text-indigo-400">{applicants.length} Applicants</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* TAB CONTENT: MANAGE POSTED JOBS */}
            {/* ======================================================== */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Active Job Postings</h2>
                    <p className="text-xs text-slate-400">Edit description details or delete outdated roles.</p>
                  </div>
                  <button
                    onClick={() => setTab('post')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                    id="add-new-job-shortcut"
                  >
                    <FiPlusCircle />
                    <span>Post New Job</span>
                  </button>
                </div>

                {jobsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(n => (
                      <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 h-56 animate-pulse space-y-4">
                        <div className="h-6 bg-slate-100 rounded w-2/3"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                      </div>
                    ))}
                  </div>
                ) : myJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        userRole="recruiter"
                        onEdit={openEditModal}
                        onDelete={handleDeleteJob}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                    <FiBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-md font-bold text-slate-800">No jobs posted yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Click the "Post New Job" button to publish your first open position.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB CONTENT: POST A JOB */}
            {/* ======================================================== */}
            {activeTab === 'post' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FiPlusCircle className="text-teal-600" />
                    <span>Create a New Position</span>
                  </h2>
                  <p className="text-xs text-slate-400">Publish a new vacancy to match with our job seekers database.</p>
                </div>

                <form onSubmit={handlePostJob} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="post-title" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Job Title *
                      </label>
                      <input
                        id="post-title"
                        type="text"
                        placeholder="e.g. Senior Frontend Engineer"
                        required
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="post-location" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Location / Work Mode *
                      </label>
                      <input
                        id="post-location"
                        type="text"
                        placeholder="e.g. London, UK (Remote) or New York, NY"
                        required
                        value={postForm.location}
                        onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="post-salary" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Salary Range (Optional)
                      </label>
                      <input
                        id="post-salary"
                        type="text"
                        placeholder="e.g. $90,000 - $110,000"
                        value={postForm.salary}
                        onChange={(e) => setPostForm({ ...postForm, salary: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="post-skills" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Required Skills * (Comma Separated)
                      </label>
                      <input
                        id="post-skills"
                        type="text"
                        placeholder="e.g. React, JavaScript, TypeScript, Tailwind"
                        required
                        value={postForm.skills}
                        onChange={(e) => setPostForm({ ...postForm, skills: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Separate skills with commas. The AI matching algorithm compares these tags directly to candidate profile inventories.</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="post-desc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Job Description *
                    </label>
                    <textarea
                      id="post-desc"
                      rows={5}
                      placeholder="Detail the roles, responsibilities, culture fit, and benefits..."
                      required
                      value={postForm.description}
                      onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setTab('manage')}
                      className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={posting}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                      id="post-job-submit"
                    >
                      {posting ? 'Publishing...' : 'Publish Position'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB CONTENT: APPLICANTS HUB */}
            {/* ======================================================== */}
            {activeTab === 'applicants' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recruitment Candidate Pipeline</h2>
                  <p className="text-xs text-slate-400">Review matching scores and shortlisting status.</p>
                </div>

                {applicantsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(n => (
                      <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 h-60 animate-pulse space-y-4">
                        <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-6 bg-slate-100 rounded-full w-24"></div>
                        <div className="h-10 bg-slate-100 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : applicants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applicants.map((applicant) => (
                      <ApplicantCard
                        key={applicant.id}
                        applicant={applicant}
                        onStatusUpdate={handleApplicantStatus}
                        onScheduleInterview={triggerInterviewScheduler}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                    <FiUsers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-md font-bold text-slate-800">No active applicants</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      There are currently no job applications matching your live vacancies.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB CONTENT: INTERVIEW PLANNER */}
            {/* ======================================================== */}
            {activeTab === 'interviews' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Scheduled Interviews Tracker</h2>
                  <p className="text-xs text-slate-400">Calendar overview of scheduled recruitment briefings.</p>
                </div>

                {interviewsLoading ? (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
                    <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-12 bg-slate-100 rounded w-full"></div>
                  </div>
                ) : interviews.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                            <th className="py-4 px-6">Candidate</th>
                            <th className="py-4 px-6">Position</th>
                            <th className="py-4 px-6">Meeting Type</th>
                            <th className="py-4 px-6">Date &amp; Time</th>
                            <th className="py-4 px-6">Scheduled On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                          {interviews.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <div>
                                  <span className="font-bold text-slate-900 block">{item.candidateName}</span>
                                  <span className="text-xs text-slate-400 font-medium">{item.candidateEmail}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-semibold text-slate-800">{item.jobTitle}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg ${
                                  item.type === 'Online' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}>
                                  {item.type === 'Online' ? <FiVideo /> : <FiMapPin />}
                                  <span>{item.type}</span>
                                </span>
                              </td>
                              <td className="py-4 px-6 font-semibold text-slate-700">
                                {new Date(item.dateTime).toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                                {new Date(item.scheduledAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                    <FiCalendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-md font-bold text-slate-800">No interviews scheduled</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Navigate to the "Applicants Hub" tab to select a candidate and schedule a discussion.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* OVERLAY EDIT MODAL FOR MANAGE TAB */}
      {/* ======================================================== */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FiEdit2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold">Edit Job Opening</h3>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                id="close-edit-modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-title" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Title *</label>
                  <input
                    id="edit-title"
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2"
                  />
                </div>
                <div>
                  <label htmlFor="edit-location" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location *</label>
                  <input
                    id="edit-location"
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-salary" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Salary Range</label>
                  <input
                    id="edit-salary"
                    type="text"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full px-4.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit-skills" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills * (Comma Separated)</label>
                  <input
                    id="edit-skills"
                    type="text"
                    required
                    value={editForm.skills}
                    onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                    className="w-full px-4.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-desc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Description *</label>
                <textarea
                  id="edit-desc"
                  rows={4}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                  id="update-job-submit"
                >
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERVIEW SCHEDULER MODAL */}
      {/* ======================================================== */}
      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        applicant={selectedApplicant}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedApplicant(null);
        }}
        onScheduleSuccess={loadAllRecruiterData}
      />
    </div>
  );
};

export default RecruiterDashboard;
