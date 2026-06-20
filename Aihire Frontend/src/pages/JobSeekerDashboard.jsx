import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { jobService, applicationService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import { 
  FiUser, FiMail, FiCpu, FiPlus, FiX, 
  FiFileText, FiUploadCloud, FiSearch, 
  FiFolder, FiCheckCircle, FiActivity, FiMapPin 
} from 'react-icons/fi';

const JobSeekerDashboard = () => {
  const { user, updateSkills, uploadResume } = useAuth();
  const { showToast } = useToast();
  
  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, jobs, applications

  // Profile Skills states
  const [newSkill, setNewSkill] = useState('');
  const [savingSkills, setSavingSkills] = useState(false);

  // Resume upload states
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Jobs Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [isSearchResult, setIsSearchResult] = useState(false);

  // Applications states
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [applyingJobIds, setApplyingJobIds] = useState({});

  // Fetch jobs / recommendations
  const loadJobs = async (query = '') => {
    setJobsLoading(true);
    try {
      if (query.trim()) {
        const results = await jobService.getJobs(query);
        setJobs(results);
        setIsSearchResult(true);
      } else {
        const results = await jobService.getRecommendations();
        setJobs(results);
        setIsSearchResult(false);
      }
    } catch (err) {
      showToast('Failed to fetch jobs', 'error');
    } finally {
      setJobsLoading(false);
    }
  };

  // Fetch applications
  const loadApplications = async () => {
    setAppsLoading(true);
    try {
      const results = await applicationService.getApplications();
      setApplications(results);
    } catch (err) {
      showToast('Failed to load applications', 'error');
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, [user?.skills]); // Reload recommendations if skills change

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (user?.skills?.includes(newSkill.trim())) {
      showToast('Skill already listed!', 'warning');
      setNewSkill('');
      return;
    }

    setSavingSkills(true);
    const updatedSkills = [...(user.skills || []), newSkill.trim()];
    try {
      await updateSkills(updatedSkills);
      showToast('Skill added!', 'success');
      setNewSkill('');
    } catch (err) {
      showToast('Failed to update skills', 'error');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    setSavingSkills(true);
    const updatedSkills = (user.skills || []).filter(s => s !== skillToRemove);
    try {
      await updateSkills(updatedSkills);
      showToast('Skill removed', 'info');
    } catch (err) {
      showToast('Failed to update skills', 'error');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        showToast('Please upload a PDF or Word document (.doc/.docx)', 'error');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    setUploadProgress(10);
    
    // Simulate upload progress interval
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 200);

    try {
      await uploadResume(resumeFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      showToast('Resume uploaded and AI matched successfully!', 'success');
      setResumeFile(null);
      // Reload applications to check if resume attachment name updated
      loadApplications();
    } catch (err) {
      clearInterval(progressInterval);
      showToast('Resume upload failed', 'error');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    loadJobs(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    loadJobs('');
  };

  const handleApply = async (jobId) => {
    setApplyingJobIds(prev => ({ ...prev, [jobId]: true }));
    try {
      await applicationService.applyToJob(jobId);
      showToast('Application submitted successfully!', 'success');
      loadApplications(); // Refresh applied jobs list
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setApplyingJobIds(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Hired': return 'bg-emerald-800 text-white border-transparent';
      case 'Shortlisted': return 'bg-green-50 text-green-700 border-green-200';
      case 'Under Review': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Applied':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dashboard Core Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {user && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Header Stats Panel */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
                  <p className="text-sm text-slate-400">Discover job offers matching your AI profile.</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700/50">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Skills Fit</span>
                    <span className="text-lg font-extrabold text-blue-400">
                      {user.skills?.length || 0} Listed
                    </span>
                  </div>
                  <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700/50">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Applications</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {applications.length} Submitted
                    </span>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* TAB CONTENT: PROFILE & RESUME */}
              {/* ======================================================== */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Profile Card & Skills */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-2xl">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                          <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Verified Candidate
                          </span>
                        </div>
                      </div>

                      {/* Skills Form & List */}
                      <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                            <FiCpu className="text-blue-500" />
                            <span>My Skill Inventory</span>
                          </h3>
                          <span className="text-xs text-slate-400">Add keywords to boost AI matching scores</span>
                        </div>

                        {/* Add skill input */}
                        <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                          <input
                            type="text"
                            placeholder="e.g. TypeScript, React, Docker"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            disabled={savingSkills}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            id="skill-input-field"
                          />
                          <button
                            type="submit"
                            disabled={savingSkills || !newSkill.trim()}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-1"
                            id="add-skill-submit"
                          >
                            <FiPlus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </form>

                        {/* Skills Pill list */}
                        <div className="flex flex-wrap gap-2">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 text-xs font-semibold"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="text-slate-400 hover:text-rose-600 focus:outline-none"
                                  title={`Remove ${skill}`}
                                >
                                  <FiX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="w-full text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm italic">
                              No skills added yet. Add skills to start matching with jobs!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Resume Upload */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                          <FiFileText className="text-blue-500" />
                          <span>Curriculum Vitae</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                          Upload your latest resume (PDF or DOC) to share with employers.
                        </p>

                        {/* Drag and Drop Zone */}
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 text-center transition-all cursor-pointer relative group">
                          <input
                            type="file"
                            id="resume-file-picker"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                          />
                          <FiUploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                          <p className="text-sm font-bold text-slate-700">Drag file here or browse</p>
                          <p className="text-xs text-slate-400 mt-1">PDF or Word files up to 5MB</p>
                        </div>

                        {/* Selected file preview */}
                        {resumeFile && (
                          <div className="mt-4 p-3 border border-blue-100 bg-blue-50/40 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FiFileText className="text-blue-600 shrink-0 w-4 h-4" />
                              <span className="text-xs font-semibold text-slate-700 truncate">{resumeFile.name}</span>
                            </div>
                            <button
                              onClick={() => setResumeFile(null)}
                              className="text-slate-400 hover:text-rose-600 focus:outline-none"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Upload progress bar */}
                        {uploading && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase mb-1">
                              <span>Analyzing and Parsing Resume...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        {user.resume && (
                          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                            <FiCheckCircle className="shrink-0" />
                            <span>Currently Active: <span className="underline">{user.resume}</span></span>
                          </div>
                        )}
                        <button
                          onClick={handleResumeUpload}
                          disabled={!resumeFile || uploading}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
                          id="upload-resume-submit"
                        >
                          {uploading ? 'Parsing...' : 'Submit to AI Match'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB CONTENT: SEARCH & RECOMMENDATIONS */}
              {/* ======================================================== */}
              {activeTab === 'jobs' && (
                <div className="space-y-6">
                  {/* Search Bar Block */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search by job title, skills (React, Node), company, or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          id="job-search-input"
                        />
                        <FiSearch className="absolute left-3.5 top-4 text-slate-400 w-4.5 h-4.5" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                          id="job-search-submit"
                        >
                          <FiSearch />
                          <span>Search Jobs</span>
                        </button>
                        {isSearching && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl border border-slate-200 transition-all"
                            id="clear-search-btn"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Header Title */}
                  <div className="flex justify-between items-center px-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FiActivity className="text-blue-500 animate-pulse" />
                        <span>
                          {isSearchResult 
                            ? `Search Results (${jobs.length} jobs found)` 
                            : 'AI Recommended Matches'}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isSearchResult
                          ? 'Showing jobs matching your search parameters'
                          : 'Ranked automatically based on your Skill Inventory match'}
                      </p>
                    </div>
                    {!isSearchResult && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                        AI Recommended
                      </span>
                    )}
                  </div>

                  {/* Jobs Grid */}
                  {jobsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
                          <div className="h-6 bg-slate-100 rounded-lg w-2/3"></div>
                          <div className="h-4 bg-slate-100 rounded-lg w-1/3"></div>
                          <div className="space-y-2 pt-4">
                            <div className="h-3 bg-slate-100 rounded-lg w-full"></div>
                            <div className="h-3 bg-slate-100 rounded-lg w-5/6"></div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <div className="h-7 bg-slate-100 rounded-full w-16"></div>
                            <div className="h-7 bg-slate-100 rounded-full w-20"></div>
                            <div className="h-7 bg-slate-100 rounded-full w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {jobs.map((job) => {
                        const hasApplied = applications.some((app) => app.jobId === job.id);
                        return (
                          <JobCard
                            key={job.id}
                            job={job}
                            userRole="jobseeker"
                            hasApplied={hasApplied}
                            isApplying={applyingJobIds[job.id]}
                            onApply={handleApply}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                      <FiFolder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-md font-bold text-slate-800">No jobs found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        We couldn't find any positions matching that keyword. Try modifying your search query or updating your skills list.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB CONTENT: APPLICATIONS */}
              {/* ======================================================== */}
              {activeTab === 'applications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Application Tracking Hub</h2>
                      <p className="text-xs text-slate-400">Monitor the live status of your job submissions.</p>
                    </div>
                  </div>

                  {appsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((n) => (
                        <div key={n} className="bg-white border border-slate-100 rounded-2xl p-6 flex justify-between items-center animate-pulse">
                          <div className="space-y-2 w-1/3">
                            <div className="h-5 bg-slate-100 rounded-lg w-full"></div>
                            <div className="h-3 bg-slate-100 rounded-lg w-1/2"></div>
                          </div>
                          <div className="h-6 bg-slate-100 rounded-full w-24"></div>
                        </div>
                      ))}
                    </div>
                  ) : applications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <div>
                                <h3 className="text-md font-bold text-slate-950">{app.jobTitle}</h3>
                                <p className="text-xs font-semibold text-slate-500">{app.company}</p>
                              </div>
                              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                              <FiMapPin className="text-slate-400 shrink-0" />
                              <span>{app.location}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-medium">Applied On</span>
                              <span className="text-slate-700 font-semibold">{new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-medium">AI Profile Match</span>
                              <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">{app.matchScore}%</span>
                            </div>

                            {app.status === 'Hired' && (
                              <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-semibold text-center pulse-animation">
                                🎉 Congratulations! You are hired for this position!
                              </div>
                            )}

                            {app.status === 'Rejected' && (
                              <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 font-medium text-center">
                                Status: Application Rejected
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                      <FiFolder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-md font-bold text-slate-800">No applications found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        You haven't applied to any job listings yet. Head over to the "Search & AI Match" tab to get started!
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
