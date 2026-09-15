import React from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  Compass,
  Users2,
  Receipt,
  Wallet,
  CheckSquare,
  Sparkles,
  FolderLock,
  AlertTriangle,
  Crown,
  Settings,
  Database,
  X,
  FileText,
  Shield,
} from 'lucide-react';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentPage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { tasks, risks, quotes, slots, events } = useSaanjh();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
  const openRisksCount = risks.filter((r) => r.status !== 'RESOLVED').length;
  const pendingQuotesCount = quotes.filter((q) => q.status === 'PENDING_AUDIT').length;
  const availableSlotsCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  const navItems = [
    {
      group: 'COMMAND',
      items: [
        { id: 'dashboard', label: 'Command Centre', icon: LayoutDashboard, badge: null },
        { id: 'new-celebration', label: 'New Celebration', icon: PlusCircle, badge: 'Intake' },
        { id: 'events', label: 'All Celebrations', icon: CalendarDays, badge: events.length },
        { id: 'event-command', label: 'Event Command Centre', icon: Compass, badge: 'Active' },
      ],
    },
    {
      group: 'PROCUREMENT & FINANCE',
      items: [
        { id: 'vendors', label: 'Curated Vendors', icon: Users2, badge: null },
        {
          id: 'quotes',
          label: 'Quote Analyzer',
          icon: Receipt,
          badge: pendingQuotesCount > 0 ? `${pendingQuotesCount} New` : null,
        },
        { id: 'budget', label: 'Royal Budget', icon: Wallet, badge: null },
      ],
    },
    {
      group: 'OPERATIONS & INTELLIGENCE',
      items: [
        {
          id: 'tasks',
          label: 'Task Manager',
          icon: CheckSquare,
          badge: pendingTasksCount > 0 ? pendingTasksCount : null,
        },
        { id: 'ai-director', label: 'Ask Saanjh AI', icon: Sparkles, badge: 'Director' },
        { id: 'documents', label: 'Document Vault', icon: FolderLock, badge: null },
        {
          id: 'risks',
          label: 'Risk Monitor',
          icon: AlertTriangle,
          badge: openRisksCount > 0 ? openRisksCount : null,
        },
      ],
    },
    {
      group: 'HOUSE INTEGRITY',
      items: [
        {
          id: 'saanjh-six',
          label: 'The Saanjh Six',
          icon: Crown,
          badge: `${availableSlotsCount} Open`,
        },
        { id: 'settings', label: 'Constitution & Settings', icon: Settings, badge: null },
        { id: 'backup', label: 'Backup / Restore', icon: Database, badge: null },
      ],
    },
  ];

  const handleItemClick = (pageId: string) => {
    onNavigate(pageId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#2D0A0E] text-[#FBF9F5] border-r border-[#C5A059]/30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#C5A059]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#E6CA65]">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif tracking-widest text-base font-bold text-[#FBF9F5]">
              SAANJH WEDDINGS
            </h2>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059]">
              Private Wedding House
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-[#FBF9F5]/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059]/70 px-3 mb-1.5 font-sans">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#3B0D11] text-[#E6CA65] border border-[#C5A059]/50 shadow-sm font-semibold'
                        : 'text-[#FBF9F5]/80 hover:bg-[#3B0D11]/60 hover:text-[#FBF9F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#E6CA65]' : 'text-[#C5A059]/70'
                        }`}
                      />
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#C5A059] text-[#2D0A0E]'
                            : typeof item.badge === 'number'
                            ? 'bg-[#C5A059]/20 text-[#E6CA65]'
                            : 'bg-white/10 text-[#FBF9F5]/80'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Brand Constitution Footer */}
      <div className="p-4 border-t border-[#C5A059]/20 bg-[#25080B]/60">
        <div className="bg-[#3B0D11]/80 border border-[#C5A059]/30 rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#E6CA65] font-semibold">
            Brand Constitution
          </p>
          <p className="font-serif italic text-xs text-[#FBF9F5]/90 mt-1">
            "WE DON'T DO 50 SHAADIS.
            <br />
            WE DO 6."
          </p>
          <div className="mt-2 text-[9px] text-[#C5A059]/70 uppercase tracking-widest font-medium">
            Season 2026-2027
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
