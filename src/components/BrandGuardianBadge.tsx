import React from 'react';
import { BrandGuardianEvaluation } from '../types';
import { Shield, Sparkles, Check, AlertTriangle } from 'lucide-react';

interface Props {
  evaluation?: BrandGuardianEvaluation;
  className?: string;
}

export const BrandGuardianBadge: React.FC<Props> = ({ evaluation, className = '' }) => {
  const sampleEval: BrandGuardianEvaluation = evaluation || {
    luxury: 9.8,
    personalization: 9.9,
    exclusivity: 10,
    hospitality: 9.6,
    designQuality: 9.7,
    operationalQuality: 9.5,
    budgetFit: 9.2,
    saanjhBrandFit: 9.8,
    verdict: "Pristine alignment with the 'We Do 6' Constitution. Uncompromising royal standard.",
    explanation:
      'Rejects all assembly-line and generic banquet fixtures. Architecture, culinary storytelling, and whisper-quiet guest logistics meet the ultra-exclusive Saanjh standard.',
  };

  const criteria = [
    { label: 'LUXURY', score: sampleEval.luxury },
    { label: 'PERSONALIZATION', score: sampleEval.personalization },
    { label: 'EXCLUSIVITY', score: sampleEval.exclusivity },
    { label: 'HOSPITALITY', score: sampleEval.hospitality },
    { label: 'DESIGN QUALITY', score: sampleEval.designQuality },
    { label: 'OPERATIONAL QUALITY', score: sampleEval.operationalQuality },
    { label: 'BUDGET FIT', score: sampleEval.budgetFit },
    { label: 'SAANJH BRAND FIT', score: sampleEval.saanjhBrandFit },
  ];

  const avgScore = (
    criteria.reduce((acc, c) => acc + c.score, 0) / criteria.length
  ).toFixed(1);

  return (
    <div
      className={`bg-[#F5F1E8] border border-[#C5A059]/40 rounded-xl p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#DFD7C2]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#3B0D11] text-[#E6CA65] flex items-center justify-center border border-[#C5A059]/50 shadow-xs">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#706E6B] font-bold">
              Permanent Internal Evaluator
            </span>
            <h4 className="font-serif text-sm font-semibold text-[#3B0D11]">
              SAANJH BRAND GUARDIAN
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#3B0D11] text-[#E6CA65] px-2.5 py-1 rounded-full text-xs font-serif font-bold border border-[#C5A059]/40">
          <Sparkles className="w-3 h-3" />
          <span>{avgScore} / 10</span>
        </div>
      </div>

      {/* Grid of 8 dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
        {criteria.map((item) => {
          const isHigh = item.score >= 8.5;
          return (
            <div
              key={item.label}
              className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-md px-2.5 py-2"
            >
              <div className="text-[10px] uppercase tracking-wider text-[#706E6B] font-semibold truncate">
                {item.label}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-serif font-bold text-sm text-[#3B0D11]">
                  {item.score}
                  <span className="text-[10px] font-normal text-[#706E6B]">/10</span>
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded-sm ${
                    isHigh
                      ? 'bg-[#1E382B]/10 text-[#1E382B]'
                      : 'bg-[#B87A81]/20 text-[#3B0D11]'
                  }`}
                >
                  {isHigh ? 'PASS' : 'FLAG'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verdict & Explanation */}
      <div className="bg-[#3B0D11]/5 border-l-2 border-[#3B0D11] p-2.5 rounded-r-md">
        <div className="flex items-center gap-1.5 text-xs font-serif font-semibold text-[#3B0D11]">
          {Number(avgScore) >= 8 ? (
            <Check className="w-3.5 h-3.5 text-[#1E382B]" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-[#B87A81]" />
          )}
          <span>{sampleEval.verdict}</span>
        </div>
        {sampleEval.explanation && (
          <p className="text-[11px] text-[#555] mt-1 leading-relaxed">
            {sampleEval.explanation}
          </p>
        )}
      </div>
    </div>
  );
};
