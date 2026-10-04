import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadeProgress, setFadeProgress] = useState(false);

  useEffect(() => {
    // Auto-advance after 2.4 seconds if user doesn't tap
    const timer = setTimeout(() => {
      setFadeProgress(true);
      setTimeout(onDismiss, 350);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleManualDismiss = () => {
    setFadeProgress(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      onClick={handleManualDismiss}
      className={`fixed inset-0 z-50 bg-[#FFFFFF] dark:bg-[#0b1120] flex flex-col justify-between items-center px-6 py-10 transition-opacity duration-300 cursor-pointer select-none ${
        fadeProgress ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Subtle Indian Tricolour Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] dark:via-slate-800 to-[#138808]" />

      {/* Top Subtle Seal & Government Public Service Header */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Ashoka Chakra emblem */}
          <div className="w-6 h-6 rounded-full border border-[#000080]/30 dark:border-blue-400/30 flex items-center justify-center p-0.5 bg-[#EBF0FA] dark:bg-blue-950/50">
            <svg viewBox="0 0 24 24" className="w-full h-full text-[#000080] dark:text-blue-300" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-[#000080] dark:text-blue-300 block text-[11px]">
              PUBLIC SERVICE INITIATIVE
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Civic Intelligence &amp; Redressal</span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#000080] dark:text-amber-300 bg-[#FFF6EC] dark:bg-amber-950/40 px-2 py-0.5 rounded border border-[#FFD4A8] dark:border-amber-800/60">
          Citizen Portal
        </span>
      </div>

      {/* Central Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto">
        {/* SARVAYA Dual-Leaf Official Emblem with Tricolour palette */}
        <div className="relative">
          <div className="w-22 h-22 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center p-2.5">
            <svg width="60" height="60" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Saffron Left Leaf */}
              <path d="M17 19.5C17 11.5 10 7.5 5.5 8.5C4.5 14 8 20.5 17 19.5Z" fill="#FF9933" />
              {/* India Green Right Leaf */}
              <path d="M17 19.5C17 10.5 24 6.5 28.5 7.5C29.5 13 26 20.5 17 19.5Z" fill="#138808" />
              <path d="M17 19V26" stroke="#000080" strokeWidth="2.2" strokeLinecap="round" />
              {/* Ashoka Chakra Blue Center Circle */}
              <circle cx="17" cy="18" r="2.8" fill="#000080" />
            </svg>
          </div>
          {/* Official Verification Shield */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#000080] text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
            <ShieldCheck size={13} className="text-[#138808]" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
            SARVAYA
          </h1>
          {/* Elegant Indian Tricolour Accent Line */}
          <div className="flex items-center justify-center gap-1.5 my-2">
            <span className="w-7 h-1.5 bg-[#FF9933] rounded-full" />
            <span className="w-7 h-1.5 bg-white dark:bg-slate-300 border border-slate-300 dark:border-slate-600 rounded-full" />
            <span className="w-7 h-1.5 bg-[#138808] rounded-full" />
          </div>
          {/* Tagline: Safer | Cleaner | Greener */}
          <p className="text-xs font-bold text-[#000080] dark:text-blue-200 tracking-wider uppercase">
            Safer &nbsp;|&nbsp; Cleaner &nbsp;|&nbsp; Greener
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed font-normal pt-1">
          Empowering citizens to report public problems and enabling authorities to prioritize, route, monitor, and resolve civic grievances.
        </p>
      </div>

      {/* Footer & Continue Prompt */}
      <div className="w-full flex flex-col items-center space-y-3 pb-2">
        <button
          onClick={handleManualDismiss}
          className="w-full max-w-xs py-3 px-4 bg-[#000080] hover:bg-[#000060] text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 border-2 border-[#FF9933]"
        >
          <span>Continue to Civic Intelligence Dashboard</span>
          <ArrowRight size={14} className="text-[#FF9933]" />
        </button>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Tap anywhere or button to proceed • Bilingual (తెలుగు / English)
        </span>
      </div>

      {/* Bottom Subtle Indian Tricolour Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] dark:via-slate-800 to-[#138808]" />
    </div>
  );
};
