import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Sparkles,
  Send,
  Crown,
  Palette,
  Receipt,
  Wallet,
  HeartHandshake,
  AlertTriangle,
  Shield,
  Loader2,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import { AIDirectorPersona } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'director';
  persona: AIDirectorPersona;
  text: string;
  timestamp: string;
}

export const AIDirectorPage: React.FC = () => {
  const { activeEvent, settings } = useSaanjh();
  const [selectedPersona, setSelectedPersona] = useState<AIDirectorPersona>('EVENT_DIRECTOR');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'director',
      persona: 'EVENT_DIRECTOR',
      text: `Good day, Ayush. The Saanjh Command Centre is under strict supervision. We are currently presiding over commission slot #${activeEvent?.commissionSlot || 1} for ${activeEvent?.clientName || 'the Royal Celebration'} at ${activeEvent?.venue || 'Udaipur'}.

How would you like me to direct operations today? You may switch my persona among Creative, Procurement, Finance, Hospitality, Risk, or the uncompromising Brand Guardian.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const personas = [
    {
      id: 'EVENT_DIRECTOR',
      label: 'Event Director',
      desc: 'Balanced operational oversight & executive decisions',
      icon: Crown,
    },
    {
      id: 'CREATIVE_DIRECTOR',
      label: 'Creative Director',
      desc: 'Scenography, spatial narrative & aesthetic integrity',
      icon: Palette,
    },
    {
      id: 'PROCUREMENT_MANAGER',
      label: 'Procurement Manager',
      desc: 'Vendor audits, contract terms & counter-offers',
      icon: Receipt,
    },
    {
      id: 'FINANCE_MANAGER',
      label: 'Finance Manager',
      desc: 'P&L, budget discipline, cash flow & leakages',
      icon: Wallet,
    },
    {
      id: 'HOSPITALITY_MANAGER',
      label: 'Hospitality Manager',
      desc: 'Guest journey, 1:2 butler protocol & royal VIPs',
      icon: HeartHandshake,
    },
    {
      id: 'RISK_MANAGER',
      label: 'Risk Manager',
      desc: '16-category proactive vulnerabilities & contingencies',
      icon: AlertTriangle,
    },
    {
      id: 'BRAND_GUARDIAN',
      label: 'Brand Guardian',
      desc: "Strict enforcement of 'We Do 6' Constitution",
      icon: Shield,
    },
  ];

  const quickPromptChips = [
    'What needs my attention right now?',
    'Review event health & critical vulnerabilities',
    'Audit budget for hidden leakages & variance',
    'Draft dignified vendor negotiation email',
    'Draft executive royal update for family patriarch',
    'Review acoustic curfew mitigation for Lake Palace',
    'Inspect Brand Guardian alignment for floral proposal',
  ];

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      persona: selectedPersona,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          persona: selectedPersona,
          eventContext: activeEvent,
        }),
      });

      const data = await res.json();
      const responseText = data.response || 'Director briefing generated.';

      const directorMsg: ChatMessage = {
        id: `msg-${Date.now()}-d`,
        sender: 'director',
        persona: selectedPersona,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, directorMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            AI Command Post
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            The Saanjh Private Event Director
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Senior autonomous counsel thinking like the owner: proactive, detail-obsessed, and uncompromising on luxury standards.
          </p>
        </div>

        <div className="bg-[#F5F1E8] border border-[#DFD7C2] px-3.5 py-1.5 rounded-xl text-xs text-[#3B0D11] font-serif">
          Active Context: <strong>{activeEvent?.clientName || 'General OS'}</strong>
        </div>
      </div>

      {/* Mode / Persona Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFD7C2]">
        {personas.map((p) => {
          const Icon = p.icon;
          const isActive = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id as AIDirectorPersona)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#3B0D11] text-[#FBF9F5] border border-[#C5A059] font-bold shadow-xs'
                  : 'bg-[#F5F1E8] text-[#706E6B] hover:text-[#3B0D11] hover:bg-[#EAE3D2]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6CA65]' : 'text-[#706E6B]'}`} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-[#706E6B] shrink-0">
          Executive Directives:
        </span>
        {quickPromptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="bg-[#FBF9F5] hover:bg-[#F5F1E8] border border-[#DFD7C2] hover:border-[#C5A059] text-[#3B0D11] text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#3B0D11] text-[#E6CA65] flex items-center justify-center border border-[#C5A059] shrink-0 mt-1 shadow-xs">
                    <Crown className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#3B0D11] text-[#FBF9F5] border border-[#C5A059]/40 rounded-br-xs'
                      : 'bg-[#F5F1E8] text-[#1E1E24] border border-[#DFD7C2] rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/10">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isUser ? 'text-[#E6CA65]' : 'text-[#3B0D11]'
                      }`}
                    >
                      {isUser ? settings.ownerName : `${msg.persona.replace('_', ' ')}`}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isUser ? 'text-[#FBF9F5]/70' : 'text-[#706E6B]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans space-y-2">{msg.text}</div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-[#DFD7C2] flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-[10px] text-[#706E6B] hover:text-[#3B0D11] flex items-center gap-1 font-medium transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#1E382B]" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Directive
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-[#706E6B]">
              <div className="w-8 h-8 rounded-full bg-[#3B0D11] text-[#E6CA65] flex items-center justify-center border border-[#C5A059]">
                <Loader2 className="w-4 h-4 animate-spin text-[#E6CA65]" />
              </div>
              <span className="font-serif italic">
                The Saanjh Director is formulating strategic response...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-[#F5F1E8] border-t border-[#DFD7C2] flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask the ${selectedPersona.replace('_', ' ')} (e.g. "Prepare the run of show for Jagmandir island Sangeet")...`}
            className="flex-1 bg-[#FBF9F5] border border-[#DFD7C2] focus:border-[#C5A059] rounded-xl px-4 py-3 text-xs text-[#1E1E24] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 bg-[#3B0D11] hover:bg-[#4A151B] disabled:opacity-50 text-[#FBF9F5] rounded-xl text-xs font-serif font-bold tracking-wider flex items-center gap-2 border border-[#C5A059]/40 shadow-xs transition-all"
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5 text-[#E6CA65]" />
          </button>
        </form>
      </div>
    </div>
  );
};
