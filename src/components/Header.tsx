import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldAlert,
  Bell,
  User,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  FileCheck2,
  PhoneCall,
  Sparkles,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { AppView } from '../types';
import { HelpAndHowToUseModal } from './HelpAndHowToUseModal';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC<{ onShowSplash?: () => void }> = ({ onShowSplash }) => {
  const {
    currentView,
    setCurrentView,
    setIsEmergencyModalOpen,
    complaints,
    newComplaintsCount,
    userRole,
    setUserRole,
    isServerConnected,
    syncWithServer,
    isSyncing,
    isOnline,
    offlineQueueCount,
    syncOfflineQueue,
  } = useCivic();

  const { theme, toggleTheme } = useTheme();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const overdueCount = complaints.filter(c => c.status === 'Overdue' || c.status === 'Escalated').length;
  const pendingVerifyCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <header className="sticky top-0 z-40 bg-[#000080] text-white shadow-md">
      {/* Subtle Indian Tricolour Top Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      {/* Top Utility Bar with Emergency 112 & Public Service Motto */}
      <div className="bg-[#00005C] px-4 py-1.5 flex items-center justify-between text-xs border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Subtle Ashok Chakra emblem motif */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#FF9933]" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="font-semibold tracking-wider text-slate-100 text-[11px]">
            Safer | Cleaner | Greener
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[#138808] bg-white/95 px-1.5 py-0.2 rounded font-extrabold text-[10px] hidden sm:inline">
            National Civic Tech
          </span>
        </div>

        {/* Immediate Danger Emergency Call 112 */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-colors shadow-xs"
          title="Emergency 112 Assistance"
        >
          <PhoneCall size={11} className="animate-pulse" />
          <span>Immediate Danger? Call 112</span>
        </button>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => setCurrentView('home')}
          className="cursor-pointer flex items-center gap-2.5 select-none"
        >
          {/* Indian Tricolour Crest Logo (Saffron Leaf + India Green Leaf + Ashoka Chakra Blue center) */}
          <div className="relative w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md border border-white/40 p-1">
            <svg viewBox="0 0 34 34" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Saffron Left Leaf */}
              <path d="M17 19.5C17 11.5 10 7.5 5.5 8.5C4.5 14 8 20.5 17 19.5Z" fill="#FF9933" />
              {/* India Green Right Leaf */}
              <path d="M17 19.5C17 10.5 24 6.5 28.5 7.5C29.5 13 26 20.5 17 19.5Z" fill="#138808" />
              <path d="M17 19V26" stroke="#000080" strokeWidth="2.2" strokeLinecap="round" />
              {/* Ashoka Chakra Blue Center Circle */}
              <circle cx="17" cy="18" r="2.8" fill="#000080" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF9933] rounded-full border border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
                SARVAYA
              </span>
              <span className="bg-[#FF9933]/25 text-[#FFD1A4] text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-[#FF9933]/50">
                CIVIC-AI
              </span>
            </div>
            <p className="text-[10px] text-blue-100 font-medium leading-none tracking-tight">
              Civic Intelligence &amp; Accountability System
            </p>
          </div>
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton compact={true} />

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:px-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-slate-100 transition-all flex items-center gap-1 shadow-2xs active:scale-95"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="text-[#FF9933] animate-spin-slow" />
                <span className="text-[10px] font-bold text-amber-200 hidden lg:inline">Light</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-blue-200" />
                <span className="text-[10px] font-bold text-blue-100 hidden lg:inline">Dark</span>
              </>
            )}
          </button>

          {/* Central DB / Offline Status & Sync Button */}
          <button
            onClick={() => (isOnline ? syncWithServer() : syncOfflineQueue())}
            disabled={isSyncing}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              !isOnline
                ? 'border-amber-400 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                : isServerConnected
                ? 'border-[#138808]/60 bg-[#138808]/20 text-emerald-300 hover:bg-[#138808]/30'
                : 'border-[#FF9933]/60 bg-[#FF9933]/20 text-[#FFD1A4]'
            }`}
            title={!isOnline ? `Offline Mode — ${offlineQueueCount} queued reports` : 'Shared Central Database Synchronization'}
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-[10px] font-bold">
              {!isOnline
                ? (offlineQueueCount > 0 ? `${offlineQueueCount} Queued` : 'Offline')
                : (isServerConnected ? 'Central DB' : 'Connecting')}
            </span>
          </button>

          {/* Quick Pipeline Demo button */}
          <button
            onClick={() => setCurrentView('pipeline-demo')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'pipeline-demo'
                ? 'bg-[#FF9933] text-[#000080] font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-100'
            }`}
          >
            <Sparkles size={13} className="text-[#FF9933]" />
            <span>Intelligence Flow</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {(overdueCount > 0 || pendingVerifyCount > 0 || newComplaintsCount > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF9933] text-[#000080] text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-[#000080]">
                  {overdueCount + pendingVerifyCount + newComplaintsCount}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-xs text-[#000080] dark:text-blue-300 uppercase tracking-wider">
                    Civic Alerts &amp; SLAs
                  </h4>
                  <span className="text-[10px] text-[#FF9933] font-bold">Live Updates</span>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {newComplaintsCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationMenu(false);
                        setCurrentView('authority');
                      }}
                      className="p-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg cursor-pointer border border-[#FF9933]/40 dark:border-[#FF9933]/30 text-xs transition"
                    >
                      <div className="font-bold text-[#E68A00] dark:text-amber-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
                        <span>{newComplaintsCount} New Complaint(s) Received</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        New submissions from citizens are waiting on the Authority Dashboard.
                      </p>
                    </div>
                  )}

                  {overdueCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationMenu(false);
                        setCurrentView('higher-authority');
                      }}
                      className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg cursor-pointer border border-red-200 dark:border-red-900/60 text-xs transition"
                    >
                      <div className="font-bold text-[#D32F2F] dark:text-red-400 flex items-center gap-1">
                        <ShieldAlert size={14} />
                        <span>{overdueCount} Overdue Complaints</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Standard SLA breached. Escalated to Commissioner dashboard.
                      </p>
                    </div>
                  )}

                  {pendingVerifyCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationMenu(false);
                        setCurrentView('my-complaints');
                      }}
                      className="p-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg cursor-pointer border border-[#138808]/30 dark:border-[#138808]/40 text-xs transition"
                    >
                      <div className="font-bold text-[#138808] dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>{pendingVerifyCount} Citizen Verification(s)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Municipal officer marked resolved. Citizen confirmation required.
                      </p>
                    </div>
                  )}

                  {overdueCount === 0 && pendingVerifyCount === 0 && newComplaintsCount === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
                      No active alerts. All civic services operating normally.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 transition-colors border border-white/15 text-xs font-semibold"
            >
              <User size={15} />
              <span className="hidden sm:inline capitalize font-bold">
                {userRole === 'authority' ? 'Authority / Admin' : 'Citizen'}
              </span>
              <ChevronDown size={13} className="text-slate-300" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 z-50 p-2.5">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Active User Role
                  </span>
                  <div className="text-xs font-bold text-[#000080] dark:text-blue-300 mt-0.5">
                    {userRole === 'authority' ? 'Municipal Officer / Admin' : 'Citizen of Vizianagaram'}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setUserRole('citizen');
                      setCurrentView('home');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                      userRole === 'citizen'
                        ? 'bg-[#FFF6EC] dark:bg-amber-950/40 text-[#000080] dark:text-amber-200 border border-[#FFD4A8] dark:border-amber-800/60 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User size={15} className={userRole === 'citizen' ? 'text-[#FF9933]' : ''} />
                      <span>Citizen Mode</span>
                    </div>
                    {userRole === 'citizen' && (
                      <span className="text-[10px] font-extrabold bg-[#FF9933] text-[#000080] px-1.5 py-0.5 rounded shadow-2xs">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setUserRole('authority');
                      setCurrentView('authority');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                      userRole === 'authority'
                        ? 'bg-[#EBF0FA] dark:bg-blue-950/40 text-[#000080] dark:text-blue-200 border border-[#B3C6EB] dark:border-blue-800/60 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className={userRole === 'authority' ? 'text-[#000080] dark:text-blue-300' : ''} />
                      <span>Authority / Admin Mode</span>
                    </div>
                    {userRole === 'authority' && (
                      <span className="text-[10px] font-bold bg-[#000080] dark:bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-2xs">
                        Active
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  {/* Theme Switcher in Dropdown */}
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Sun size={14} className="text-[#FF9933]" />
                      ) : (
                        <Moon size={14} className="text-[#000080] dark:text-blue-300" />
                      )}
                      <span>Display Mode</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHelpOpen(true);
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition"
                  >
                    <HelpCircle size={14} className="text-[#FF9933]" />
                    <span>How to Test &amp; Guide</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Indian Tricolour Bottom Border Strip */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] opacity-75" />

      {/* Help Modal */}
      {isHelpOpen && <HelpAndHowToUseModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />}
    </header>
  );
};
