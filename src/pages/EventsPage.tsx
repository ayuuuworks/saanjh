import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
}

export const EventsPage: React.FC<Props> = ({ onNavigate }) => {
  const { events, deleteEvent, setActiveEventId } = useSaanjh();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.eventType === filterType;
  });

  const handleOpenEvent = (id: string) => {
    setActiveEventId(id);
    onNavigate('event-command');
  };

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '₹ 0';
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            Active Roster
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            All Celebrations & Commissions
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Managing {events.length} of 6 maximum seasonal commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-[#F5F1E8] border border-[#DFD7C2] rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#3B0D11] text-[#FBF9F5]'
                  : 'text-[#706E6B] hover:text-[#3B0D11]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#3B0D11] text-[#FBF9F5]'
                  : 'text-[#706E6B] hover:text-[#3B0D11]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('new-celebration')}
            className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-[#E6CA65]" />
            <span>Intake Celebration</span>
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const healthBg =
              evt.health === 'GREEN'
                ? 'bg-[#1E382B]/10 text-[#1E382B] border-[#1E382B]/30'
                : evt.health === 'AMBER'
                ? 'bg-[#C5A059]/20 text-[#3B0D11] border-[#C5A059]'
                : 'bg-[#B87A81]/20 text-[#3B0D11] border-[#B87A81]';

            return (
              <div
                key={evt.id}
                className="bg-[#FBF9F5] border border-[#DFD7C2] hover:border-[#C5A059] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
                        Slot {evt.commissionSlot} • {evt.eventType}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#3B0D11] mt-0.5">
                        {evt.clientName}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${healthBg}`}
                    >
                      {evt.health}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-[#555]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{evt.weddingDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="truncate">
                        {evt.venue}, {evt.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{evt.guestCount} Royal Guests</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>
                        Budget: <strong>{formatCurrency(evt.estimatedBudget)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Financial Bar */}
                  <div className="mt-4 pt-3 border-t border-[#DFD7C2]">
                    <div className="flex items-center justify-between text-[11px] text-[#706E6B] mb-1">
                      <span>Committed: {formatCurrency(evt.committedBudget)}</span>
                      <span>Phase: {evt.currentPhase}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EAE3D2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3B0D11]"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((evt.committedBudget / evt.estimatedBudget) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-3 border-t border-[#DFD7C2] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Delete celebration commission for ${evt.clientName}?`)) {
                        deleteEvent(evt.id);
                      }
                    }}
                    className="p-2 text-[#706E6B] hover:text-[#B87A81] rounded-lg transition-colors"
                    title="Release Commission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEvent(evt.id)}
                      className="px-3 py-1.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Command Post</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E6CA65]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] text-[#3B0D11] font-serif uppercase tracking-wider text-[10px] border-b border-[#DFD7C2]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Slot & Code</th>
                  <th className="py-3.5 px-4 font-bold">Client / Family</th>
                  <th className="py-3.5 px-4 font-bold">Date & City</th>
                  <th className="py-3.5 px-4 font-bold">Guests</th>
                  <th className="py-3.5 px-4 font-bold">Est. Budget</th>
                  <th className="py-3.5 px-4 font-bold">Committed</th>
                  <th className="py-3.5 px-4 font-bold">Health</th>
                  <th className="py-3.5 px-4 font-bold">Phase</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD7C2]">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#F5F1E8]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#C5A059]">
                      Slot {evt.commissionSlot}
                    </td>
                    <td className="py-3 px-4 font-serif font-semibold text-[#3B0D11]">
                      {evt.clientName}
                    </td>
                    <td className="py-3 px-4 text-[#555]">
                      {evt.weddingDate} • {evt.city}
                    </td>
                    <td className="py-3 px-4 text-[#555]">{evt.guestCount}</td>
                    <td className="py-3 px-4 font-serif font-semibold text-[#1E382B]">
                      {formatCurrency(evt.estimatedBudget)}
                    </td>
                    <td className="py-3 px-4 text-[#555]">
                      {formatCurrency(evt.committedBudget)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          evt.health === 'GREEN'
                            ? 'bg-[#1E382B]/10 text-[#1E382B]'
                            : 'bg-[#B87A81]/20 text-[#3B0D11]'
                        }`}
                      >
                        {evt.health}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#706E6B]">{evt.currentPhase}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEvent(evt.id)}
                        className="px-3 py-1 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-md font-serif text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
