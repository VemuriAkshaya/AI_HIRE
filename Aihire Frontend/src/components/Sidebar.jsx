import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, 
  FiSearch, 
  FiCheckSquare, 
  FiPlusSquare, 
  FiList, 
  FiUsers, 
  FiCalendar, 
  FiX, 
  FiBriefcase 
} from 'react-icons/fi';

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  const jobSeekerMenu = [
    { id: 'profile', name: 'Profile & Resume', icon: FiUser },
    { id: 'jobs', name: 'Search & AI Match', icon: FiSearch },
    { id: 'applications', name: 'My Applications', icon: FiCheckSquare },
  ];

  const recruiterMenu = [
    { id: 'manage', name: 'Manage Jobs', icon: FiList },
    { id: 'post', name: 'Post New Job', icon: FiPlusSquare },
    { id: 'applicants', name: 'Applicants Hub', icon: FiUsers },
    { id: 'interviews', name: 'Interview Planner', icon: FiCalendar },
  ];

  const menuItems = user.role === 'recruiter' ? recruiterMenu : jobSeekerMenu;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside Sidebar for Mobile */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <FiBriefcase className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold text-white">AIHire Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity info at top of Sidebar (SaaS Style) */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 font-bold border border-blue-600/35">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user.role === 'recruiter' ? 'Recruiter Account' : 'Candidate'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose(); // Close mobile menu if open
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-600">
          &copy; 2026 AIHire Portal.
          <br /> All rights reserved.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
