import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Wallet,
  AlertTriangle,
  Plus,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Receipt,
  Download,
  Filter,
} from 'lucide-react';
import { BudgetItem } from '../types';

export const BudgetPage: React.FC = () => {
  const { budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem, activeEvent, events, setActiveEventId } = useSaanjh();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = [
    'ALL',
    'Venue & Accommodation',
    'Décor & Production',
    'Floral',
    'Catering & Bar',
    'Entertainment & Artists',
    'Photography & Cinema',
    'Invitations & Stationery',
    'Gifting & Favours',
    'Wardrobe & Styling',
    'Hair & Makeup',
    'Transport & Logistics',
    'Hospitality & Manpower',
    'Security & Permissions',
    'Rituals & Priest',
    'Miscellaneous',
    'Contingency Reserve',
  ];

  const [formData, setFormData] = useState<Partial<BudgetItem>>({
    category: 'Décor & Production',
    item: '',
    estimated: 1000000,
    committed: 0,
    paid: 0,
    vendorAssigned: '',
    notes: '',
  });

  const isDemoActive = Boolean(activeEvent?.isDemo);

  const eventBudgetItems = React.useMemo(() => {
    if (!activeEvent) return [];
    return budgetItems.filter(
      (b) => b.eventId === activeEvent.id && (isDemoActive || !b.isDemo)
    );
  }, [budgetItems, activeEvent, isDemoActive]);

  const filteredItems = eventBudgetItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const totalEstimated = activeEvent
    ? activeEvent.estimatedBudget || eventBudgetItems.reduce((acc, i) => acc + i.estimated, 0)
    : eventBudgetItems.reduce((acc, i) => acc + i.estimated, 0);
  const totalCommitted = eventBudgetItems.reduce((acc, i) => acc + i.committed, 0);
  const totalPaid = eventBudgetItems.reduce((acc, i) => acc + i.paid, 0);
  const totalBalance = totalCommitted - totalPaid;

  const contingencyItem = eventBudgetItems.find((b) => b.category === 'Contingency Reserve');
  const contingencyPercentage =
    totalEstimated > 0 && contingencyItem
      ? (contingencyItem.estimated / totalEstimated) * 100
      : 0;

  const overCommittedItems = eventBudgetItems.filter((i) => i.committed > i.estimated);

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '₹ 0';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item) return;

    const newItem: BudgetItem = {
      id: `bgt-${Date.now()}`,
      eventId: activeEvent?.id || 'evt-demo-001',
      eventName: activeEvent?.clientName || 'Royal Celebration',
      isDemo: Boolean(activeEvent?.isDemo),
      category: formData.category || 'Décor & Production',
      item: formData.item,
      estimated: Number(formData.estimated) || 0,
      committed: Number(formData.committed) || 0,
      paid: Number(formData.paid) || 0,
      balance: (Number(formData.committed) || 0) - (Number(formData.paid) || 0),
      vendorAssigned: formData.vendorAssigned || 'Unassigned',
      notes: formData.notes || '',
    };

    addBudgetItem(newItem);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            Royal Financial Directorate
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            Celebration Budget & P&L Ledgers
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Active Event: <strong>{activeEvent?.clientName || 'General Ledger'}</strong> • 16-Category Royal Architecture
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 text-[#E6CA65]" />
          <span>Add Budget Item</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
            Total Estimated Budget
          </span>
          <span className="font-serif text-2xl font-bold text-[#3B0D11] block mt-1">
            {formatCurrency(totalEstimated)}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">Baseline Framework</span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
            Total Committed
          </span>
          <span className="font-serif text-2xl font-bold text-[#1E382B] block mt-1">
            {formatCurrency(totalCommitted)}
          </span>
          <span className="text-[10px] text-[#1E382B] font-semibold mt-0.5 block">
            {totalEstimated > 0 ? Math.round((totalCommitted / totalEstimated) * 100) : 0}% of Est.
          </span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
            Total Paid Out
          </span>
          <span className="font-serif text-2xl font-bold text-[#C5A059] block mt-1">
            {formatCurrency(totalPaid)}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">Disbursed to Vendors</span>
        </div>

        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
            Pending Balance Due
          </span>
          <span className="font-serif text-2xl font-bold text-[#B87A81] block mt-1">
            {formatCurrency(totalBalance)}
          </span>
          <span className="text-[10px] text-[#706E6B] mt-0.5 block">To Settle Post-Wedding</span>
        </div>
      </div>

      {/* Automated Warnings Bar */}
      {(overCommittedItems.length > 0 || contingencyPercentage < 10) && (
        <div className="bg-[#B87A81]/10 border border-[#B87A81]/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#3B0D11]">
            <ShieldAlert className="w-4 h-4 text-[#B87A81]" />
            <span>DIRECTOR FINANCIAL WARNINGS ACTIVE</span>
          </div>
          <div className="space-y-1 text-xs text-[#444]">
            {overCommittedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B87A81]" />
                <span>
                  <strong>{item.category}:</strong> "{item.item}" committed ({formatCurrency(item.committed)}) exceeds estimated ({formatCurrency(item.estimated)}).
                </span>
              </div>
            ))}
            {contingencyPercentage < 10 && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B87A81]" />
                <span>
                  <strong>Contingency Warning:</strong> Contingency reserve is currently {contingencyPercentage.toFixed(1)}% of total budget (Saanjh safety mandate is ≥10%).
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration Selector & Categories Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#FBF9F5] p-3 rounded-xl border border-[#DFD7C2] text-xs">
          <span className="text-[#706E6B] font-semibold uppercase text-[10px]">Celebration:</span>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => setActiveEventId(e.target.value)}
            className="bg-[#F5F1E8] border border-[#DFD7C2] text-[#3B0D11] rounded-md px-2.5 py-1 text-xs font-serif font-bold focus:outline-hidden cursor-pointer"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.clientName} (Slot {evt.commissionSlot}) - {evt.city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFD7C2]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3B0D11] text-[#FBF9F5] font-semibold border border-[#C5A059]/50'
                  : 'bg-[#F5F1E8] text-[#706E6B] hover:text-[#3B0D11] hover:bg-[#EAE3D2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Table / Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#FBF9F5] border-2 border-dashed border-[#DFD7C2] rounded-2xl p-12 text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
            No budget line items recorded yet for this event.
          </h3>
          <p className="text-xs text-[#706E6B] max-w-md mx-auto">
            No expenditure line items have been scheduled for {activeEvent?.clientName || 'this celebration'} yet. Click &quot;Add Line Item&quot; above to allocate funds.
          </p>
        </div>
      ) : (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F1E8] text-[#3B0D11] font-serif uppercase tracking-wider text-[10px] border-b border-[#DFD7C2]">
              <tr>
                <th className="py-3 px-4 font-bold">Category & Scope</th>
                <th className="py-3 px-4 font-bold">Vendor Assigned</th>
                <th className="py-3 px-4 font-bold">Estimated</th>
                <th className="py-3 px-4 font-bold">Committed</th>
                <th className="py-3 px-4 font-bold">Paid Out</th>
                <th className="py-3 px-4 font-bold">Balance</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFD7C2]">
              {filteredItems.map((item) => {
                const isOver = item.committed > item.estimated;
                const isSettled = item.paid >= item.committed && item.committed > 0;

                return (
                  <tr key={item.id} className="hover:bg-[#F5F1E8]/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-serif font-bold text-[#3B0D11] block">
                        {item.item}
                      </span>
                      <span className="text-[10px] text-[#706E6B] block mt-0.5">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#555] font-medium">
                      {item.vendorAssigned}
                    </td>
                    <td className="py-3 px-4 font-serif text-[#706E6B]">
                      {formatCurrency(item.estimated)}
                    </td>
                    <td
                      className={`py-3 px-4 font-serif font-bold ${
                        isOver ? 'text-[#B87A81]' : 'text-[#3B0D11]'
                      }`}
                    >
                      {formatCurrency(item.committed)}
                    </td>
                    <td className="py-3 px-4 font-serif text-[#1E382B]">
                      {formatCurrency(item.paid)}
                    </td>
                    <td className="py-3 px-4 font-serif text-[#706E6B]">
                      {formatCurrency(item.balance)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                          isOver
                            ? 'bg-[#B87A81]/20 text-[#3B0D11]'
                            : isSettled
                            ? 'bg-[#1E382B]/15 text-[#1E382B]'
                            : 'bg-[#C5A059]/20 text-[#3B0D11]'
                        }`}
                      >
                        {isOver ? 'OVERRUN' : isSettled ? 'SETTLED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteBudgetItem(item.id)}
                        className="p-1 text-[#706E6B] hover:text-[#B87A81] rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              Add New Line Item to Royal Budget
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Item Title / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="e.g. Submerged Hydraulic Pontoon Anchoring"
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    {categories.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Assigned Vendor</label>
                  <input
                    type="text"
                    value={formData.vendorAssigned}
                    onChange={(e) => setFormData({ ...formData, vendorAssigned: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                    placeholder="e.g. Udaipur Maritime Works"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Estimated (INR)</label>
                  <input
                    type="number"
                    value={formData.estimated}
                    onChange={(e) => setFormData({ ...formData, estimated: Number(e.target.value) })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Committed (INR)</label>
                  <input
                    type="number"
                    value={formData.committed}
                    onChange={(e) => setFormData({ ...formData, committed: Number(e.target.value) })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Paid Out (INR)</label>
                  <input
                    type="number"
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7C2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#706E6B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
