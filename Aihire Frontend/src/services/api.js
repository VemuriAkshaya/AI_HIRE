import axios from 'axios';

// Toggle this to false when connecting to a real backend
const USE_MOCK = true;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aihire_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// MOCK DATA SEEDING & LOCAL STORAGE HELPERS
// ==========================================

const SEED_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA (Hybrid)',
    description: 'We are looking for a Senior Frontend Engineer to build beautiful and intuitive dashboard interfaces. You will work with React, TypeScript, and Tailwind CSS to design APIs and developer interfaces that feel premium.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    salary: '$160,000 - $190,000',
    recruiterId: 'rec-1',
    createdAt: '2026-06-15T10:00:00Z'
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    company: 'Vercel',
    location: 'Remote',
    description: 'Join the framework team to build next-generation web platforms. You will design, build, and optimize features for Next.js, integrating closely with serverless functions and modern edge rendering.',
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS'],
    salary: '$140,000 - $170,000',
    recruiterId: 'rec-1',
    createdAt: '2026-06-16T12:00:00Z'
  },
  {
    id: 'job-3',
    title: 'UI/UX React Developer',
    company: 'Canva',
    location: 'Sydney, Australia',
    description: 'Create engaging visual design platforms using React. Work with state-of-the-art canvas APIs, motion engineering, and responsive design systems. Passion for visual aesthetics is highly preferred.',
    skills: ['React', 'JavaScript', 'CSS Modules', 'Framer Motion'],
    salary: '$110,000 - $130,000',
    recruiterId: 'rec-2',
    createdAt: '2026-06-17T09:00:00Z'
  },
  {
    id: 'job-4',
    title: 'Junior Web Designer & Frontend dev',
    company: 'Figma',
    location: 'New York, NY',
    description: 'Support the development of Figma\'s designer landing page experiences. Excellent understanding of HTML, CSS, and component systems in React is required.',
    skills: ['React', 'HTML', 'CSS', 'JavaScript'],
    salary: '$80,000 - $100,000',
    recruiterId: 'rec-2',
    createdAt: '2026-06-18T08:30:00Z'
  }
];

const SEED_APPLICANTS = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateName: 'Alex Seeker',
    candidateEmail: 'seeker@aihire.com',
    skills: ['React', 'JavaScript', 'Tailwind CSS'],
    resumeName: 'alex_resume_2026.pdf',
    status: 'Applied', // Applied, Under Review, Shortlisted, Rejected, Hired
    matchScore: 75,
    appliedAt: '2026-06-17T11:00:00Z'
  },
  {
    id: 'app-2',
    jobId: 'job-1',
    candidateName: 'Sarah Jenkins',
    candidateEmail: 'sarah.j@gmail.com',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    resumeName: 'sarah_jenkins_cv.pdf',
    status: 'Shortlisted',
    matchScore: 100,
    appliedAt: '2026-06-16T14:30:00Z'
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    candidateName: 'Michael Chang',
    candidateEmail: 'michael.c@yahoo.com',
    skills: ['React', 'Node.js', 'JavaScript'],
    resumeName: 'm_chang_resume.docx',
    status: 'Under Review',
    matchScore: 60,
    appliedAt: '2026-06-18T06:00:00Z'
  }
];

// Initialize Mock database
const initMockDB = () => {
  if (!localStorage.getItem('aihire_mock_jobs')) {
    localStorage.setItem('aihire_mock_jobs', JSON.stringify(SEED_JOBS));
  }
  if (!localStorage.getItem('aihire_mock_applications')) {
    localStorage.setItem('aihire_mock_applications', JSON.stringify(SEED_APPLICANTS));
  }
  if (!localStorage.getItem('aihire_mock_users')) {
    // Default demo users
    const defaultUsers = [
      { name: 'Alex Seeker', email: 'seeker@aihire.com', password: 'password', role: 'jobseeker', skills: ['React', 'JavaScript', 'Tailwind CSS'], resume: 'alex_resume_2026.pdf' },
      { name: 'Sarah Jenkins', email: 'sarah.j@gmail.com', password: 'password', role: 'jobseeker', skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'], resume: 'sarah_jenkins_cv.pdf' },
      { name: 'Elena Recruiter', email: 'recruiter@aihire.com', password: 'password', role: 'recruiter' }
    ];
    localStorage.setItem('aihire_mock_users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('aihire_mock_interviews')) {
    localStorage.setItem('aihire_mock_interviews', JSON.stringify([]));
  }
};

initMockDB();

// Helper to simulate API call latency
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// AI Matching Helper: calculates match percentage based on matched skills
export const calculateMatchScore = (jobSkills, userSkills) => {
  if (!jobSkills || jobSkills.length === 0) return 100;
  if (!userSkills || userSkills.length === 0) return 0;
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
  const matched = jobSkills.filter(skill => userSkillsLower.includes(skill.toLowerCase().trim()));
  
  const rawScore = Math.round((matched.length / jobSkills.length) * 100);
  return Math.min(Math.max(rawScore, 10), 100); // Between 10% and 100%
};

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export const authService = {
  login: async (email, password) => {
    if (USE_MOCK) {
      await delay(800);
      const users = JSON.parse(localStorage.getItem('aihire_mock_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('aihire_token', token);
      localStorage.setItem('aihire_user', JSON.stringify(user));
      
      return { token, user };
    } else {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('aihire_token', response.data.token);
      localStorage.setItem('aihire_user', JSON.stringify(response.data.user));
      return response.data;
    }
  },

  register: async (name, email, password, role) => {
    if (USE_MOCK) {
      await delay(800);
      const users = JSON.parse(localStorage.getItem('aihire_mock_users') || '[]');
      const exist = users.find(u => u.email === email);
      if (exist) {
        throw new Error('Email is already registered');
      }
      
      const newUser = { name, email, password, role, skills: [], resume: null };
      users.push(newUser);
      localStorage.setItem('aihire_mock_users', JSON.stringify(users));
      
      // Auto login after registration
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('aihire_token', token);
      localStorage.setItem('aihire_user', JSON.stringify(newUser));
      
      return { token, user: newUser };
    } else {
      const response = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('aihire_token', response.data.token);
      localStorage.setItem('aihire_user', JSON.stringify(response.data.user));
      return response.data;
    }
  },

  logout: () => {
    localStorage.removeItem('aihire_token');
    localStorage.removeItem('aihire_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('aihire_user');
    return user ? JSON.parse(user) : null;
  },

  updateProfile: async (skills) => {
    if (USE_MOCK) {
      await delay(500);
      const currentUser = JSON.parse(localStorage.getItem('aihire_user') || '{}');
      currentUser.skills = skills;
      localStorage.setItem('aihire_user', JSON.stringify(currentUser));
      
      // Update in users table
      const users = JSON.parse(localStorage.getItem('aihire_mock_users') || '[]');
      const updatedUsers = users.map(u => u.email === currentUser.email ? { ...u, skills } : u);
      localStorage.setItem('aihire_mock_users', JSON.stringify(updatedUsers));
      
      // Recalculate applicant match scores for this seeker in applications table
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      
      const updatedApps = apps.map(app => {
        if (app.candidateEmail === currentUser.email) {
          const job = jobs.find(j => j.id === app.jobId);
          const score = job ? calculateMatchScore(job.skills, skills) : app.matchScore;
          return { ...app, skills, matchScore: score };
        }
        return app;
      });
      localStorage.setItem('aihire_mock_applications', JSON.stringify(updatedApps));

      return currentUser;
    } else {
      const response = await api.put('/auth/profile', { skills });
      localStorage.setItem('aihire_user', JSON.stringify(response.data.user));
      return response.data.user;
    }
  },

  uploadResume: async (file) => {
    if (USE_MOCK) {
      await delay(1200); // Simulate network upload time
      const currentUser = JSON.parse(localStorage.getItem('aihire_user') || '{}');
      currentUser.resume = file.name;
      localStorage.setItem('aihire_user', JSON.stringify(currentUser));

      const users = JSON.parse(localStorage.getItem('aihire_mock_users') || '[]');
      const updatedUsers = users.map(u => u.email === currentUser.email ? { ...u, resume: file.name } : u);
      localStorage.setItem('aihire_mock_users', JSON.stringify(updatedUsers));

      // Also update any of their applications with the resume name
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const updatedApps = apps.map(app => {
        if (app.candidateEmail === currentUser.email) {
          return { ...app, resumeName: file.name };
        }
        return app;
      });
      localStorage.setItem('aihire_mock_applications', JSON.stringify(updatedApps));

      return { fileName: file.name, user: currentUser };
    } else {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await api.post('/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('aihire_user', JSON.stringify(response.data.user));
      return response.data;
    }
  }
};

export const jobService = {
  getJobs: async (searchQuery = '') => {
    if (USE_MOCK) {
      await delay(600);
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      if (!searchQuery.trim()) {
        return jobs;
      }
      
      const query = searchQuery.toLowerCase().trim();
      return jobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.skills.some(s => s.toLowerCase().includes(query))
      );
    } else {
      const url = searchQuery ? `/jobs?search=${encodeURIComponent(searchQuery)}` : '/jobs';
      const response = await api.get(url);
      return response.data;
    }
  },

  getRecommendations: async () => {
    if (USE_MOCK) {
      await delay(500);
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      const user = authService.getCurrentUser();
      
      if (!user || !user.skills || user.skills.length === 0) {
        // Return jobs with basic default scores if no skills listed
        return jobs.map(job => ({
          ...job,
          matchScore: 50 // Default
        }));
      }

      // Calculate matching score for each job
      const recommended = jobs.map(job => {
        const matchScore = calculateMatchScore(job.skills, user.skills);
        return { ...job, matchScore };
      });

      // Sort by match score descending
      return recommended.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      const response = await api.get('/recommendations');
      return response.data;
    }
  },

  postJob: async (jobData) => {
    if (USE_MOCK) {
      await delay(700);
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      const user = authService.getCurrentUser();
      
      const newJob = {
        id: `job-${Date.now()}`,
        title: jobData.title,
        company: jobData.company || 'My Startup',
        location: jobData.location,
        description: jobData.description,
        skills: Array.isArray(jobData.skills) 
          ? jobData.skills 
          : jobData.skills.split(',').map(s => s.trim()).filter(Boolean),
        salary: jobData.salary || 'Competitive',
        recruiterId: user ? user.email : 'recruiter@aihire.com',
        createdAt: new Date().toISOString()
      };
      
      jobs.unshift(newJob);
      localStorage.setItem('aihire_mock_jobs', JSON.stringify(jobs));
      return newJob;
    } else {
      const response = await api.post('/jobs', jobData);
      return response.data;
    }
  },

  updateJob: async (id, jobData) => {
    if (USE_MOCK) {
      await delay(600);
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      const index = jobs.findIndex(j => j.id === id);
      if (index === -1) throw new Error('Job not found');
      
      const updatedJob = {
        ...jobs[index],
        title: jobData.title,
        location: jobData.location,
        description: jobData.description,
        skills: Array.isArray(jobData.skills) 
          ? jobData.skills 
          : jobData.skills.split(',').map(s => s.trim()).filter(Boolean),
        salary: jobData.salary
      };
      
      jobs[index] = updatedJob;
      localStorage.setItem('aihire_mock_jobs', JSON.stringify(jobs));
      return updatedJob;
    } else {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    }
  },

  deleteJob: async (id) => {
    if (USE_MOCK) {
      await delay(500);
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      const filtered = jobs.filter(j => j.id !== id);
      localStorage.setItem('aihire_mock_jobs', JSON.stringify(filtered));
      
      // Also delete application records for this job
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const filteredApps = apps.filter(a => a.jobId !== id);
      localStorage.setItem('aihire_mock_applications', JSON.stringify(filteredApps));

      return { success: true };
    } else {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    }
  }
};

export const applicationService = {
  applyToJob: async (jobId) => {
    if (USE_MOCK) {
      await delay(600);
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const user = authService.getCurrentUser();
      
      if (!user) throw new Error('Authentication required');
      
      const alreadyApplied = apps.find(a => a.jobId === jobId && a.candidateEmail === user.email);
      if (alreadyApplied) throw new Error('You have already applied to this job!');
      
      const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const matchScore = calculateMatchScore(job.skills, user.skills);
      
      const newApp = {
        id: `app-${Date.now()}`,
        jobId: jobId,
        candidateName: user.name,
        candidateEmail: user.email,
        skills: user.skills || [],
        resumeName: user.resume || 'Not Provided',
        status: 'Applied',
        matchScore: matchScore,
        appliedAt: new Date().toISOString()
      };
      
      apps.push(newApp);
      localStorage.setItem('aihire_mock_applications', JSON.stringify(apps));
      return newApp;
    } else {
      const response = await api.post('/apply', { jobId });
      return response.data;
    }
  },

  getApplications: async () => {
    if (USE_MOCK) {
      await delay(500);
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const user = authService.getCurrentUser();
      if (!user) return [];
      
      if (user.role === 'jobseeker') {
        // Filter by seeker's email, join with Job details
        const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
        const seekerApps = apps.filter(app => app.candidateEmail === user.email);
        
        return seekerApps.map(app => {
          const job = jobs.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job ? job.title : 'Deleted Position',
            company: job ? job.company : 'N/A',
            location: job ? job.location : 'N/A'
          };
        });
      } else {
        // Recruiter sees applicants for their posted jobs
        const jobs = JSON.parse(localStorage.getItem('aihire_mock_jobs') || '[]');
        const recruiterJobs = jobs.filter(j => j.recruiterId === user.email);
        const recruiterJobIds = recruiterJobs.map(j => j.id);
        
        const recruiterApps = apps.filter(app => recruiterJobIds.includes(app.jobId));
        return recruiterApps.map(app => {
          const job = recruiterJobs.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job ? job.title : 'Unknown Job'
          };
        });
      }
    } else {
      const response = await api.get('/applications');
      return response.data;
    }
  },

  updateApplicantStatus: async (applicationId, status) => {
    if (USE_MOCK) {
      await delay(500);
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const index = apps.findIndex(a => a.id === applicationId);
      if (index === -1) throw new Error('Application not found');
      
      apps[index].status = status; // Shortlisted, Rejected, Hired
      localStorage.setItem('aihire_mock_applications', JSON.stringify(apps));
      return apps[index];
    } else {
      const response = await api.put(`/applications/${applicationId}/status`, { status });
      return response.data;
    }
  }
};

export const interviewService = {
  scheduleInterview: async (interviewData) => {
    if (USE_MOCK) {
      await delay(700);
      const interviews = JSON.parse(localStorage.getItem('aihire_mock_interviews') || '[]');
      const newInterview = {
        id: `int-${Date.now()}`,
        applicantId: interviewData.applicantId,
        candidateName: interviewData.candidateName,
        candidateEmail: interviewData.candidateEmail,
        jobTitle: interviewData.jobTitle,
        type: interviewData.type, // Online / Offline
        dateTime: interviewData.dateTime,
        scheduledAt: new Date().toISOString()
      };
      
      interviews.unshift(newInterview);
      localStorage.setItem('aihire_mock_interviews', JSON.stringify(interviews));
      
      // Auto upgrade applicant status to Under Review or Shortlisted if not already
      const apps = JSON.parse(localStorage.getItem('aihire_mock_applications') || '[]');
      const appIndex = apps.findIndex(a => a.id === interviewData.applicantId);
      if (appIndex !== -1 && apps[appIndex].status === 'Applied') {
        apps[appIndex].status = 'Under Review';
        localStorage.setItem('aihire_mock_applications', JSON.stringify(apps));
      }
      
      return newInterview;
    } else {
      const response = await api.post('/schedule-interview', interviewData);
      return response.data;
    }
  },

  getScheduledInterviews: async () => {
    if (USE_MOCK) {
      await delay(400);
      const interviews = JSON.parse(localStorage.getItem('aihire_mock_interviews') || '[]');
      const user = authService.getCurrentUser();
      
      if (!user) return [];
      if (user.role === 'jobseeker') {
        return interviews.filter(i => i.candidateEmail === user.email);
      } else {
        // For recruiter, show all
        return interviews;
      }
    } else {
      const response = await api.get('/interviews');
      return response.data;
    }
  }
};

export default api;
