"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function GlobalToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent) => {
      const newToast: ToastProps = {
        id: `toast-${Date.now()}`,
        message: e.detail.message,
        type: e.detail.type || 'info'
      };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('app-toast', handleToast as EventListener);
    return () => window.removeEventListener('app-toast', handleToast as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`animate-fade-in pointer-events-auto shadow-lg rounded-xl p-4 flex items-start gap-3 backdrop-blur-md border ${
            toast.type === 'success' ? 'bg-status-success/90 border-status-success text-white' :
            toast.type === 'error' ? 'bg-error/90 border-error text-white' :
            toast.type === 'warning' ? 'bg-tertiary-container/90 border-tertiary text-on-tertiary-container' :
            'bg-surface-container-high/90 border-primary/50 text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined mt-0.5">
            {toast.type === 'success' ? 'check_circle' :
             toast.type === 'error' ? 'error' :
             toast.type === 'warning' ? 'warning' : 'notifications_active'}
          </span>
          <div className="flex-1">
            <p className="font-label-md font-bold text-sm leading-tight">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

// Helper to trigger toast
export const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app-toast', { detail: { message, type } });
    window.dispatchEvent(event);
  }
};
