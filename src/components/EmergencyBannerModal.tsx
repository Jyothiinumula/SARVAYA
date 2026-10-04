import React from 'react';
import { useCivic } from '../context/CivicContext';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';

export const EmergencyBannerModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen } = useCivic();

  if (!isEmergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border-2 border-[#D64545] dark:border-red-600 overflow-hidden">
        {/* Header */}
        <div className="bg-[#D64545] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Immediate Danger?</h3>
              <p className="text-xs text-white/90">Life Safety & Critical Emergency Protocol</p>
            </div>
          </div>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 leading-relaxed font-medium">
            <strong className="font-bold text-[#D64545] dark:text-red-400 block mb-1">
              IMPORTANT CIVIC NOTICE:
            </strong>
            SARVAYA is an asynchronous civic intelligence and public grievance resolution platform.
            <span className="font-bold text-slate-900 dark:text-white">
              {' '}SARVAYA must NOT and does NOT pretend to replace emergency first responders.
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            If you are witnessing an active accident, live electrical short-circuit, structural collapse, fire hazard, or immediate physical threat to human life, dial national emergency helplines immediately:
          </p>

          {/* Quick Dial Buttons */}
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            <a
              href="tel:112"
              className="flex items-center justify-between p-3.5 bg-[#D64545] hover:bg-[#c03939] text-white rounded-xl shadow-md transition-all group font-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <PhoneCall size={20} />
                </div>
                <div className="text-left">
                  <div className="text-base font-extrabold tracking-wide">Call 112 (National Emergency)</div>
                  <div className="text-[11px] text-white/80 font-normal">All-in-one Police, Fire & Medical Helpline</div>
                </div>
              </div>
              <span className="text-xs bg-white text-[#D64545] px-3 py-1.5 rounded-lg font-bold group-hover:bg-slate-100">
                DIAL NOW
              </span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:100"
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
              >
                <ShieldAlert size={16} className="text-[#0878C9]" />
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">Police</span>
                  <span className="font-bold">100</span>
                </div>
              </a>
              <a
                href="tel:108"
                className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
              >
                <ShieldAlert size={16} className="text-[#2E9B63]" />
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">Ambulance</span>
                  <span className="font-bold">108</span>
                </div>
              </a>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition"
            >
              Return to SARVAYA Civic Reporting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
