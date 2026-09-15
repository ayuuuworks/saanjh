import React, { useState } from 'react';
import { SaanjhProvider } from './context/SaanjhContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CostGuardModal } from './components/CostGuardModal';
import { FirstRunModal } from './components/FirstRunModal';
import { MeetingNotesModal } from './components/MeetingNotesModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { NewCelebrationPage } from './pages/NewCelebrationPage';
import { EventsPage } from './pages/EventsPage';
import { EventCommandCentrePage } from './pages/EventCommandCentrePage';
import { VendorsPage } from './pages/VendorsPage';
import { QuotesPage } from './pages/QuotesPage';
import { BudgetPage } from './pages/BudgetPage';
import { TasksPage } from './pages/TasksPage';
import { AIDirectorPage } from './pages/AIDirectorPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RisksPage } from './pages/RisksPage';
import { SaanjhSixPage } from './pages/SaanjhSixPage';
import { SettingsPage } from './pages/SettingsPage';
import { BackupPage } from './pages/BackupPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [meetingNotesOpen, setMeetingNotesOpen] = useState<boolean>(false);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'new-celebration':
        return <NewCelebrationPage onNavigate={setCurrentPage} />;
      case 'events':
        return <EventsPage onNavigate={setCurrentPage} />;
      case 'event-command':
        return <EventCommandCentrePage onNavigate={setCurrentPage} />;
      case 'vendors':
        return <VendorsPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'budget':
        return <BudgetPage />;
      case 'tasks':
        return <TasksPage />;
      case 'ai-director':
        return <AIDirectorPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'risks':
        return <RisksPage />;
      case 'saanjh-six':
        return <SaanjhSixPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage />;
      case 'backup':
        return <BackupPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#1E1E24] font-sans flex flex-col selection:bg-[#C5A059]/30 selection:text-[#3B0D11]">
      {/* Top Header */}
      <Header
        currentPage={currentPage}
        onNavigate={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenMeetingNotes={() => setMeetingNotesOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-hidden">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Modals */}
      <CostGuardModal />
      <FirstRunModal />
      <MeetingNotesModal
        isOpen={meetingNotesOpen}
        onClose={() => setMeetingNotesOpen(false)}
        onNavigate={setCurrentPage}
      />
    </div>
  );
};

export default function App() {
  return (
    <SaanjhProvider>
      <AppContent />
    </SaanjhProvider>
  );
}
