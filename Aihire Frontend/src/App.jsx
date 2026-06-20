import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import PrivateRoute from './routes/PrivateRoute';

// Pages
import LoginSeeker from './pages/LoginSeeker';
import RegisterSeeker from './pages/RegisterSeeker';
import LoginRecruiter from './pages/LoginRecruiter';
import RegisterRecruiter from './pages/RegisterRecruiter';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';

// Helper component to redirect root "/" dynamically
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    return <Navigate to="/seeker/dashboard" replace />;
  }

  return <Navigate to="/seeker/login" replace />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Dynamic Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth Routes */}
            <Route path="/seeker/login" element={<LoginSeeker />} />
            <Route path="/seeker/register" element={<RegisterSeeker />} />
            <Route path="/recruiter/login" element={<LoginRecruiter />} />
            <Route path="/recruiter/register" element={<RegisterRecruiter />} />

            {/* Protected Candidate Dashboard */}
            <Route
              path="/seeker/dashboard"
              element={
                <PrivateRoute allowedRole="jobseeker">
                  <JobSeekerDashboard />
                </PrivateRoute>
              }
            />

            {/* Protected Recruiter Dashboard */}
            <Route
              path="/recruiter/dashboard"
              element={
                <PrivateRoute allowedRole="recruiter">
                  <RecruiterDashboard />
                </PrivateRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
