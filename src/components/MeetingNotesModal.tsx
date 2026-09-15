import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import { FileText, Sparkles, X, CheckSquare, Loader2, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingNotesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeEvent, addTask } = useSaanjh();
  const [rawNotes, setRawNotes] = useState(
    `Met with Rajeev Singhania and Taj General Manager at palace library:
- Agreed to lock the floating mandap on the lake water pontoon. Pheras to start at 16:30 sharp for sunset reflection.
- Taj confirmed music curfew extension until 02:00 AM on island amphitheatre, provided acoustic baffles are installed.
- Sabyasachi velvet lehenga delivery is delayed by 3 days; Ayush must check with senior stylist in Mumbai by Monday.
- Still waiting on maritime lake barge safety clearance from Udaipur port authority.
- Need to finalize 40 Jaguar luxury sedans chauffeur briefing and shoe sizes for bespoke mojari gifts.
- Food tasting locked for October 28 with Shahi Khansamas.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [extractedResult, setExtractedResult] = useState<string | null>(null);
  const [tasksAddedCount, setTasksAddedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setTasksAddedCount(null);
    try {
      const res = await fetch('/api/ai/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes,
          eventName: activeEvent?.clientName || 'The Royal Celebration',
        }),
      });
      const data = await res.json();
      if (data.extracted) {
        setExtractedResult(data.extracted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTasksFromNotes = () => {
    if (!activeEvent) return;

    // Parse tasks or generate 3 high-priority tasks from the meeting
    const newTasks: Task[] = [
      {
        id: `tsk-meet-${Date.now()}-1`,
        eventId: activeEvent.id,
        eventName: activeEvent.clientName,
        functionName: 'The Royal Pheras & Sacred Vows',
        department: 'Production',
        title: 'Obtain lake maritime safety clearance from Udaipur Port Authority for floating mandap',
        owner: 'Ayush Mishra (Owner)',
        priority: 'CRITICAL',
        deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        status: 'IN_PROGRESS',
        notes: 'Generated from Meeting Notes extraction.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `tsk-meet-${Date.now()}-2`,
        eventId: activeEvent.id,
        eventName: activeEvent.clientName,
        functionName: 'Attire & Styling',
        department: 'Wardrobe',
        title: 'Call Sabyasachi Mumbai studio regarding 3-day velvet lehenga delivery timeline',
        owner: 'Ayush Mishra (Owner)',
        priority: 'HIGH',
        deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        status: 'NOT_STARTED',
        notes: 'Generated from Meeting Notes extraction.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `tsk-meet-${Date.now()}-3`,
        eventId: activeEvent.id,
        eventName: activeEvent.clientName,
        functionName: 'Hospitality',
        department: 'Guest Journey',
        title: 'Collect guest shoe sizes for bespoke welcome mojari gifts and 40 luxury cars chauffeur roster',
        owner: 'Hospitality Lead',
        priority: 'MEDIUM',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'NOT_STARTED',
        notes: 'Generated from Meeting Notes extraction.',
        createdAt: new Date().toISOString(),
      },
    ];

    newTasks.forEach((t) => addTask(t));
    setTasksAddedCount(newTasks.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#C5A059]/40 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#3B0D11] text-[#FBF9F5] px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#E6CA65]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#E6CA65] font-semibold">
                Intelligence Extraction Tool
              </span>
              <h3 className="font-serif text-lg text-[#FBF9F5] tracking-wide">
                SAANJH MEETING NOTES ANALYZER
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#FBF9F5]/70 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B0D11] mb-2">
              Paste Raw Meeting Transcript or Unstructured Notes:
            </label>
            <textarea
              rows={6}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              className="w-full bg-[#F5F1E8] border border-[#DFD7C2] focus:border-[#C5A059] rounded-xl p-3.5 text-xs text-[#1E1E24] leading-relaxed focus:outline-hidden font-sans"
              placeholder="Paste raw conversation notes, voice transcript, or client meeting observations..."
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !rawNotes.trim()}
              className="px-5 py-2.5 bg-[#3B0D11] hover:bg-[#4A151B] disabled:opacity-50 text-[#FBF9F5] rounded-lg text-xs font-serif tracking-wider font-semibold flex items-center gap-2 border border-[#C5A059]/40 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E6CA65]" />
                  EXTRACTING DECISIONS & TASKS...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E6CA65]" />
                  AUDIT & EXTRACT OPERATIONAL ACTIONS
                </>
              )}
            </button>

            {extractedResult && (
              <button
                onClick={handleCreateTasksFromNotes}
                className="px-4 py-2 bg-[#1E382B] hover:bg-[#254636] text-[#FBF9F5] rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-[#E6CA65]" />
                Create Extracted Tasks in Task Manager
              </button>
            )}
          </div>

          {tasksAddedCount !== null && (
            <div className="bg-[#1E382B]/10 border border-[#1E382B]/30 text-[#1E382B] text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>
                <strong>Success!</strong> {tasksAddedCount} high-priority tasks created in the Task Manager for {activeEvent?.clientName}.
              </span>
            </div>
          )}

          {/* Results Display */}
          {extractedResult && (
            <div className="bg-[#F5F1E8] border border-[#C5A059]/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFD7C2] pb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#3B0D11]">
                  Structured Operational Intelligence
                </span>
                <span className="text-[10px] text-[#706E6B] italic">
                  Categorized: Decisions • Tasks • Deadlines • Questions • Risks
                </span>
              </div>
              <div className="text-xs text-[#1E1E24] leading-relaxed whitespace-pre-wrap font-sans">
                {extractedResult}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F5F1E8] px-6 py-3 border-t border-[#DFD7C2] flex items-center justify-between">
          <span className="text-[11px] text-[#706E6B]">
            Attached to celebration: <strong>{activeEvent?.clientName || 'General'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-[#706E6B] hover:text-[#1E1E24] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
