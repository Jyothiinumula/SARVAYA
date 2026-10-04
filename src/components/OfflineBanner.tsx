import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, HardDriveDownload } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, offlineQueueCount, syncOfflineQueue, isSyncing } = useCivic();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  useEffect(() => {
    if (!prevOnline && isOnline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => setShowRestoredNotice(false), 5000);
      return () => clearTimeout(timer);
    }
    setPrevOnline(isOnline);
  }, [isOnline, prevOnline]);

  if (isOnline && !showRestoredNotice && offlineQueueCount === 0) {
    return null;
  }

  // If user just came back online
  if (isOnline && showRestoredNotice) {
    return (
      <div className="fixed top-14 left-4 right-4 z-40 max-w-lg mx-auto bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-400 flex items-center justify-between text-xs animate-slideDown">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-white shrink-0 animate-bounce" />
          <div>
            <span className="font-extrabold block">Network Connection Restored</span>
            <span className="text-[11px] text-emerald-100">
              Synchronizing local drafts &amp; queued civic reports with Municipal Hub.
            </span>
          </div>
        </div>
        <button
          onClick={() => syncOfflineQueue()}
          disabled={isSyncing}
          className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-xl text-[11px] hover:bg-emerald-50 transition shrink-0 ml-2"
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>
    );
  }

  // If offline
  if (!isOnline) {
    return (
      <div className="fixed top-14 left-4 right-4 z-40 max-w-lg mx-auto bg-amber-600 dark:bg-amber-700 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-amber-400 flex items-center justify-between text-xs animate-slideDown">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <WifiOff size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold">Offline Mode — Local-First Active</span>
              {offlineQueueCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-amber-900 rounded-full font-black text-[10px]">
                  {offlineQueueCount} Queued
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-100 leading-tight mt-0.5">
              You can capture photos &amp; draft civic reports. They will be saved to your device and synced when connected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If online but still has pending offline queue items
  if (offlineQueueCount > 0) {
    return (
      <div className="fixed top-14 left-4 right-4 z-40 max-w-lg mx-auto bg-[#000080] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#FF9933]/60 flex items-center justify-between text-xs animate-slideDown">
        <div className="flex items-center gap-2">
          <CloudUpload size={16} className="text-[#FF9933] shrink-0 animate-pulse" />
          <div>
            <span className="font-extrabold block">
              {offlineQueueCount} Offline Report{offlineQueueCount > 1 ? 's' : ''} Ready to Sync
            </span>
            <span className="text-[11px] text-blue-200">
              Captured while disconnected. Tap to upload to Central DB.
            </span>
          </div>
        </div>
        <button
          onClick={() => syncOfflineQueue()}
          disabled={isSyncing}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#FF9933] hover:bg-[#ff8a14] text-[#000080] font-black rounded-xl text-xs transition shadow-xs shrink-0 ml-2"
        >
          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    );
  }

  return null;
};
