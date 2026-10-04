import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  FileText,
  Camera,
  MapPin,
  MoreHorizontal,
  Building2,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  BookmarkCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { AppView } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Wifi, WifiOff, CloudUpload } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, complaints, isOnline, offlineQueueCount, syncOfflineQueue, isSyncing } = useCivic();
  const { theme, toggleTheme } = useTheme();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const draftsCount = complaints.filter(c => c.isDraft).length;
  const overdueCount = complaints.filter(c => c.status === 'Overdue' || c.status === 'Escalated').length;

  return (
    <>
      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-slideUp text-slate-800 dark:text-slate-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Subtle Indian Tricolour Handle */}
            <div className="flex items-center justify-center gap-1 mx-auto mb-4">
              <span className="w-5 h-1 bg-[#FF9933] rounded-full" />
              <span className="w-5 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
              <span className="w-5 h-1 bg-[#138808] rounded-full" />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
                Civic Portals &amp; Extended Modules
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="text-xs text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Authority Dashboard */}
              <button
                onClick={() => {
                  setCurrentView('authority');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition ${
                  currentView === 'authority'
                    ? 'border-[#000080] dark:border-blue-600 bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#EBF0FA] dark:bg-blue-950/80 text-[#000080] dark:text-blue-300 flex items-center justify-center border border-[#B3C6EB] dark:border-blue-800">
                  <Building2 size={18} />
                </div>
                <div className="text-xs font-bold text-[#000080] dark:text-blue-200">Authority Dashboard</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Ward officers, SLA actions &amp; resolve</div>
              </button>

              {/* Escalation Desk */}
              <button
                onClick={() => {
                  setCurrentView('higher-authority');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition ${
                  currentView === 'higher-authority'
                    ? 'border-[#D32F2F] dark:border-red-700 bg-red-50 dark:bg-red-950/50 text-[#D32F2F] dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 text-[#D32F2F] dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800">
                  <ShieldAlert size={18} />
                </div>
                <div className="text-xs font-bold flex items-center justify-between text-slate-800 dark:text-slate-100">
                  <span>Escalation Desk</span>
                  {overdueCount > 0 && (
                    <span className="bg-[#D32F2F] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                      {overdueCount}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Overdue monitor &amp; executive orders</div>
              </button>

              {/* Intelligence Walkthrough (Saffron Accent) */}
              <button
                onClick={() => {
                  setCurrentView('pipeline-demo');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition ${
                  currentView === 'pipeline-demo'
                    ? 'border-[#FF9933] dark:border-amber-600 bg-[#FFF6EC] dark:bg-amber-950/50 text-[#000080] dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF6EC] dark:bg-amber-950/80 text-[#E68A00] dark:text-[#FF9933] flex items-center justify-center border border-[#FFD4A8] dark:border-amber-800">
                  <Sparkles size={18} />
                </div>
                <div className="text-xs font-bold text-[#000080] dark:text-amber-200">Intelligence Walkthrough</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Interactive grievance resolution flow</div>
              </button>

              {/* Future Scope (India Green Accent) */}
              <button
                onClick={() => {
                  setCurrentView('future-scope');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition ${
                  currentView === 'future-scope'
                    ? 'border-[#138808] dark:border-emerald-600 bg-[#EDF8ED] dark:bg-emerald-950/50 text-[#138808] dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#EDF8ED] dark:bg-emerald-950/80 text-[#138808] dark:text-emerald-400 flex items-center justify-center border border-[#A6DDA6] dark:border-emerald-800">
                  <SlidersHorizontal size={18} />
                </div>
                <div className="text-xs font-bold text-[#138808] dark:text-emerald-300">Future Scope</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Sustainability &amp; Green Points preview</div>
              </button>
            </div>

            {/* Theme Settings & Preferences inside More Menu */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      theme === 'dark'
                        ? 'bg-amber-500/20 text-[#FF9933] border border-amber-500/30'
                        : 'bg-blue-100 text-[#000080] border border-blue-200'
                    }`}
                  >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Display Mode</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#FF9933]/15 text-[#E68A00] dark:text-[#FF9933]">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {theme === 'dark'
                        ? 'High-contrast dark slate theme active'
                        : 'Crisp national civic tricolour theme active'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle dark and light theme"
                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-700 text-[#000080] dark:text-white shadow-xs border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={13} className="text-[#FF9933]" />
                      <span>Switch to Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={13} className="text-[#000080] dark:text-blue-300" />
                      <span>Switch to Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Local-First Data Caching & PWA Install Card */}
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isOnline
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Local-First Caching</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isOnline
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-[#138808] dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isOnline ? 'Online / Synced' : 'Offline Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {offlineQueueCount > 0
                        ? `${offlineQueueCount} report(s) saved locally awaiting sync`
                        : isOnline
                        ? 'Service worker & IndexedDB ready for offline reporting'
                        : 'Capture & drafting available without network'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {offlineQueueCount > 0 && isOnline && (
                    <button
                      onClick={() => syncOfflineQueue()}
                      disabled={isSyncing}
                      className="px-2.5 py-1.5 bg-[#FF9933] hover:bg-[#ff8a14] text-[#000080] font-black rounded-xl text-xs flex items-center gap-1 shadow-xs"
                    >
                      <CloudUpload size={12} />
                      <span>{isSyncing ? '...' : 'Sync'}</span>
                    </button>
                  )}
                  <PWAInstallButton compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] max-w-md mx-auto">
        {/* Subtle Indian Tricolour top line of bottom nav */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#FF9933] via-white dark:via-slate-500 to-[#138808] opacity-80" />

        <div className="flex items-center justify-around px-2 py-1.5 relative border-t border-slate-100 dark:border-slate-800">
          {/* 1. Home */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              setCurrentView('home');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              currentView === 'home'
                ? 'text-[#000080] dark:text-[#FF9933] font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#000080] dark:hover:text-blue-300 font-medium'
            }`}
          >
            <Home
              size={20}
              className={
                currentView === 'home'
                  ? 'stroke-[2.5] text-[#000080] dark:text-[#FF9933]'
                  : 'stroke-2 text-slate-500 dark:text-slate-400'
              }
            />
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </button>

          {/* 2. My Complaints */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              setCurrentView('my-complaints');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
              currentView === 'my-complaints'
                ? 'text-[#000080] dark:text-[#FF9933] font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#000080] dark:hover:text-blue-300 font-medium'
            }`}
          >
            <FileText
              size={20}
              className={
                currentView === 'my-complaints'
                  ? 'stroke-[2.5] text-[#000080] dark:text-[#FF9933]'
                  : 'stroke-2 text-slate-500 dark:text-slate-400'
              }
            />
            <span className="text-[10px] mt-1 tracking-tight">My Complaints</span>
            {draftsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-[#FF9933] rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* 3. CENTER CAMERA / REPORT BUTTON */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              onClick={() => {
                setShowMoreMenu(false);
                setCurrentView('capture');
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#000080] via-[#000060] to-[#000080] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-white dark:ring-slate-900 border-2 border-[#FF9933]"
              aria-label="CivicCapture - Report a Civic Issue"
              title="CivicCapture - Report an Issue"
            >
              <Camera size={25} className="text-white" />
            </button>
            <span className="text-[10px] font-extrabold text-[#000080] dark:text-[#FF9933] mt-1">Report</span>
          </div>

          {/* 4. Nearby Issues (Civic Map) */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              setCurrentView('nearby-map');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              currentView === 'nearby-map'
                ? 'text-[#000080] dark:text-[#FF9933] font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#000080] dark:hover:text-blue-300 font-medium'
            }`}
          >
            <MapPin
              size={20}
              className={
                currentView === 'nearby-map'
                  ? 'stroke-[2.5] text-[#000080] dark:text-[#FF9933]'
                  : 'stroke-2 text-slate-500 dark:text-slate-400'
              }
            />
            <span className="text-[10px] mt-1 tracking-tight">Nearby Issues</span>
          </button>

          {/* 5. More */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              showMoreMenu ||
              currentView === 'authority' ||
              currentView === 'higher-authority' ||
              currentView === 'future-scope' ||
              currentView === 'pipeline-demo'
                ? 'text-[#000080] dark:text-[#FF9933] font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#000080] dark:hover:text-blue-300 font-medium'
            }`}
          >
            <MoreHorizontal
              size={20}
              className={`stroke-2 ${
                showMoreMenu ||
                currentView === 'authority' ||
                currentView === 'higher-authority' ||
                currentView === 'future-scope' ||
                currentView === 'pipeline-demo'
                  ? 'text-[#000080] dark:text-[#FF9933]'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
