import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiBriefcase, FiMenu } from 'react-icons/fi';
import { useToast } from './Toast';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        
        {/* Left Section: Brand & Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden focus:outline-none"
            aria-label="Toggle Sidebar"
            id="mobile-menu-btn"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                AI<span className="text-blue-600">Hire</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                AI Match v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            {/* User Profile Summary */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>

            {/* Role Badge */}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                user.role === 'recruiter'
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
            </span>

            {/* Profile Avatar / Avatar Fallback */}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150 focus:outline-none"
              title="Logout"
              id="nav-logout-btn"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
