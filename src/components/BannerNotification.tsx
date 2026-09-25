import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, X, Info } from 'lucide-react';

export const BannerNotification: React.FC = () => {
  const { bannerNotification, setBannerNotification } = useApp();

  if (!bannerNotification) return null;

  return (
    <div className="bg-slate-800 border-b border-teal-500/30 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-slate-200">
          <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{bannerNotification}</span>
        </div>
        <button
          onClick={() => setBannerNotification(null)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
