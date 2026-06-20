import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiBriefcase, FiUser } from 'react-icons/fi';
import { useToast } from '../components/Toast';

const LoginRecruiter = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      showToast(`Welcome back, Elena! (Recruiter)`, 'success');
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-slate-50 to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-200">
            <FiBriefcase className="w-6 h-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            AI<span className="text-teal-600">Hire</span> for Recruiters
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Post jobs, review applicant match scores, and book interviews.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="recruiter-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  id="recruiter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="recruiter@aihire.com"
                />
                <FiMail className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label htmlFor="recruiter-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="recruiter-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  placeholder="••••••••"
                />
                <FiLock className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50"
              id="recruiter-login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-1.5">
                  Access Portal <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Links */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-500">
            New organization?{' '}
            <Link to="/recruiter/register" className="font-bold text-teal-600 hover:text-teal-850 hover:underline">
              Create Organization Account
            </Link>
          </p>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-widest">Looking for work?</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Link
            to="/seeker/login"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FiUser className="text-blue-600" />
            Switch to Candidate Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginRecruiter;
