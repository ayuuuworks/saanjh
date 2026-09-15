import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileJson,
} from 'lucide-react';

export const BackupPage: React.FC = () => {
  const { exportDataJSON, importDataJSON, clearDemoData, settings } = useSaanjh();
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleDownload = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saanjh-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Backup file exported successfully.' });
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const res = importDataJSON(importText);
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'All celebration records, quotes, and tasks successfully restored.',
      });
      setImportText('');
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to import JSON data.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
          Data Sovereignty & Continuity
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
          Backup, Export & Data Portability
        </h1>
        <p className="text-xs text-[#706E6B] mt-0.5">
          Full 100% JSON data ownership. Export complete celebrations, vendors, quotes, and budgets anytime.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-[#1E382B]/10 border border-[#1E382B]/30 rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1E382B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E382B] space-y-1">
          <span className="font-serif font-bold text-sm block">
            Absolute Data Privacy Guarantee
          </span>
          <p className="leading-relaxed">
            All client names, royal guest lists, budgets, contracts, and vendor rates remain strictly in your browser and on your private runtime. No third-party data broker or advertising tracking is ever permitted.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[#1E382B]/10 text-[#1E382B] border border-[#1E382B]/30'
              : 'bg-[#B87A81]/20 text-[#3B0D11] border border-[#B87A81]'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B0D11]">
              Export Full Operating Archive
            </h3>
            <p className="text-xs text-[#706E6B]">
              Generates a single comprehensive JSON file with all events, slots, vendors, and ledger data.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-xl text-xs font-serif font-bold tracking-wider flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-[#E6CA65]" />
            <span>Download JSON Archive</span>
          </button>
        </div>
        <div className="text-[11px] text-[#706E6B]">
          Last Export / Backup Recorded: <strong>{settings.lastBackupDate || 'Never'}</strong>
        </div>
      </div>

      {/* Import / Restore Section */}
      <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
          Restore from JSON Archive
        </h3>
        <p className="text-xs text-[#555]">
          Paste the raw JSON contents of your previous Saanjh backup below to restore all records.
        </p>

        <textarea
          rows={5}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste JSON archive string here..."
          className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-xl p-3 text-xs font-mono text-[#1E1E24] focus:outline-hidden"
        />

        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="px-5 py-2 bg-[#3B0D11] hover:bg-[#4A151B] disabled:opacity-50 text-[#FBF9F5] rounded-xl text-xs font-serif font-bold tracking-wider flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#E6CA65]" />
            <span>Restore From Archive</span>
          </button>
        </div>
      </div>

      {/* Clear Demo Data */}
      <div className="bg-[#FBF9F5] border border-[#B87A81]/40 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-sm text-[#3B0D11]">
            Clear Demonstration Records
          </h4>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Removes all sample demo celebrations and resets all 6 commission slots to available.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear all demo celebrations and sample data?')) {
              clearDemoData();
              setStatusMessage({ type: 'success', text: 'Demo records removed.' });
            }
          }}
          className="px-4 py-2 bg-[#B87A81]/15 hover:bg-[#B87A81]/25 text-[#3B0D11] border border-[#B87A81]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Demo Data</span>
        </button>
      </div>
    </div>
  );
};
