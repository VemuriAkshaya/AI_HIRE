import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-white transition-all duration-300 transform translate-y-0 scale-100 ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-slate-900 border-rose-500 text-rose-400'
                : toast.type === 'warning'
                ? 'bg-slate-900 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-blue-500 text-blue-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <FiCheckCircle className="text-xl shrink-0" />}
              {toast.type === 'error' && <FiAlertCircle className="text-xl shrink-0" />}
              {toast.type === 'warning' && <FiAlertCircle className="text-xl shrink-0" />}
              {toast.type === 'info' && <FiInfo className="text-xl shrink-0" />}
              
              <span className="text-sm font-medium text-slate-200">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
