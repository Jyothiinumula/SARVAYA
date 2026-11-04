import React, { useState } from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { EmergencyBannerModal } from './components/EmergencyBannerModal';
import { HomePage } from './components/HomePage';
import { CivicCaptureView } from './components/CivicCaptureView';
import { MyComplaintsView } from './components/MyComplaintsView';
import { ComplaintDetailView } from './components/ComplaintDetailView';
import { NearbyCivicMapView } from './components/NearbyCivicMapView';
import { AuthorityDashboardView } from './components/AuthorityDashboardView';
import { HigherAuthorityEscalationView } from './components/HigherAuthorityEscalationView';
import { FutureScopeView } from './components/FutureScopeView';
import { PipelineDemoWalkthrough } from './components/PipelineDemoWalkthrough';
import { SplashScreen } from './components/SplashScreen';
import { OfflineBanner } from './components/OfflineBanner';

const AppContent: React.FC = () => {
  const { currentView } = useCivic();
  const [showSplash, setShowSplash] = useState(true);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'capture':
        return <CivicCaptureView />;
      case 'my-complaints':
      case 'drafts':
        return <MyComplaintsView />;
      case 'complaint-detail':
        return <ComplaintDetailView />;
      case 'nearby-map':
        return <NearbyCivicMapView />;
      case 'authority':
        return <AuthorityDashboardView />;
      case 'higher-authority':
        return <HigherAuthorityEscalationView />;
      case 'future-scope':
        return <FutureScopeView />;
      case 'pipeline-demo':
        return <PipelineDemoWalkthrough />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 flex flex-col font-['Inter',sans-serif] transition-colors duration-200">
      {/* Opening Splash Screen */}
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

      {/* Top Header */}
      <Header onShowSplash={() => setShowSplash(true)} />

      {/* Offline Status & Sync Queue Banner */}
      <OfflineBanner />

      {/* Main Container - Fully responsive & wide on laptop/desktop (max-w-7xl) while mobile-friendly */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Immediate Danger 112 Modal */}
      <EmergencyBannerModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CivicProvider>
        <AppContent />
      </CivicProvider>
    </ThemeProvider>
  );
}
