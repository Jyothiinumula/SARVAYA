import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Users,
  Clock,
  HeartPulse,
  Layers,
  MapPin,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CivicComplaint, SmartPriorityAnalysis, FactorRating } from '../types';
import { getOrCalculateSmartPriority } from '../services/civicIntelligence';

interface SmartPriorityAnalysisCardProps {
  complaint: CivicComplaint;
  defaultExpanded?: boolean;
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
}

export const SmartPriorityAnalysisCard: React.FC<SmartPriorityAnalysisCardProps> = ({
  complaint,
  defaultExpanded = true,
  compact = false,
  className = '',
  showTitle = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const analysis: SmartPriorityAnalysis = getOrCalculateSmartPriority(complaint);

  // Factor Rating Badge Styling with Indian Tricolour harmony
  const getRatingBadge = (rating: FactorRating) => {
    switch (rating) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] animate-pulse" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-[#EDF8ED] dark:bg-emerald-950/50 text-[#138808] dark:text-emerald-400 border border-[#A6DDA6] dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
            Low
          </span>
        );
    }
  };

  const getPriorityTheme = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return {
          bg: 'bg-red-500',
          badgeBg: 'bg-red-50 dark:bg-red-950/60 text-[#D32F2F] dark:text-red-400 border border-red-200 dark:border-red-900/60',
          cardBorder: 'border-red-200 dark:border-red-900/50',
          gradientBg: 'from-red-50/70 via-white to-amber-50/40 dark:from-red-950/20 dark:via-slate-900 dark:to-amber-950/20',
          indicator: 'bg-[#D32F2F]',
          meterColor: 'bg-gradient-to-r from-[#FF9933] to-[#D32F2F]',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-[#FF9933]',
          badgeBg: 'bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 border border-[#FFD4A8] dark:border-amber-800/60',
          cardBorder: 'border-[#FFD4A8] dark:border-amber-800/50',
          gradientBg: 'from-[#FFF6EC] via-white to-[#F0F5FD] dark:from-amber-950/20 dark:via-slate-900 dark:to-blue-950/20',
          indicator: 'bg-[#FF9933]',
          meterColor: 'bg-gradient-to-r from-[#000080] to-[#FF9933]',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-[#138808]',
          badgeBg: 'bg-[#EDF8ED] dark:bg-emerald-950/50 text-[#138808] dark:text-emerald-400 border border-[#A6DDA6] dark:border-emerald-800/60',
          cardBorder: 'border-emerald-200 dark:border-emerald-900/50',
          gradientBg: 'from-[#EDF8ED] via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950',
          indicator: 'bg-[#138808]',
          meterColor: 'bg-gradient-to-r from-slate-300 to-[#138808]',
        };
    }
  };

  const theme = getPriorityTheme(analysis.priority);

  return (
    <div
      className={`rounded-2xl border ${theme.cardBorder} bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Interactive Expandable Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-gradient-to-r from-[#000080]/5 via-[#FF9933]/5 to-[#138808]/5 dark:from-blue-950/30 dark:via-amber-950/20 dark:to-emerald-950/20 hover:from-[#000080]/10 cursor-pointer flex items-center justify-between gap-3 select-none border-b border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#000080] text-[#FF9933] flex items-center justify-center shadow-xs shrink-0 border border-[#FF9933]/30">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {showTitle && (
                <span className="font-extrabold text-xs sm:text-sm text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] tracking-tight">
                  SmartPriority™ Analysis
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                6-Factor Civic Engine
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Explainable impact-based priority analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-2xs ${theme.badgeBg}`}>
              {analysis.priority} PRIORITY
            </span>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              Score: {analysis.score || 75}/100
            </span>
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            aria-label="Toggle SmartPriority explanation"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Explanation Section */}
      {isExpanded && (
        <div className="p-4 space-y-3.5 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-950 animate-fadeIn text-xs">
          {/* Priority Headline and Score Meter */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Calculated Priority Assessment
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-black text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
                  Priority:{' '}
                  <span
                    className={
                      analysis.priority === 'HIGH'
                        ? 'text-[#D32F2F]'
                        : analysis.priority === 'MEDIUM'
                        ? 'text-[#E68A00]'
                        : 'text-[#138808]'
                    }
                  >
                    {analysis.priority}
                  </span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Urgency Score: {analysis.score || 75}/100
                </span>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span>Urgency</span>
                <span>{analysis.score || 75}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full ${theme.meterColor} transition-all duration-500`}
                  style={{ width: `${analysis.score || 75}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reason: 6 Civic Factor Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
                Reason: Analyzed Factors
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Evaluated on submission</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Factor 1: Safety Risk */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-[#FF9933] transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <ShieldAlert size={14} className="text-[#D32F2F]" />
                    <span>Safety Risk</span>
                  </span>
                  {getRatingBadge(analysis.safetyRisk)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {analysis.safetyRiskDetails || 'Immediate physical risk to commuters and pedestrians'}
                </p>
              </div>

              {/* Factor 2: People Affected */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-[#000080] dark:hover:border-blue-400 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <Users size={14} className="text-[#000080] dark:text-blue-300" />
                    <span>People Affected</span>
                  </span>
                  {getRatingBadge(analysis.peopleAffected)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {analysis.peopleAffectedDetails || 'Scale of commuter/resident exposure'}
                </p>
              </div>

              {/* Factor 3: Duration */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-[#FF9933] transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <Clock size={14} className="text-[#E68A00]" />
                    <span>Duration of Problem</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-[#b97816] dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono">
                    {analysis.duration || '3 days'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Active persistence: {analysis.durationLevel || 'Medium'} duration without resolution
                </p>
              </div>

              {/* Factor 4: Public Health Impact */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-[#138808] transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <HeartPulse size={14} className="text-[#138808]" />
                    <span>Public Health Impact</span>
                  </span>
                  {getRatingBadge(analysis.publicHealthImpact)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {analysis.publicHealthImpactDetails || 'Sanitation, odor, disease vectors & contaminated runoff'}
                </p>
              </div>

              {/* Factor 5: Recurrence / Related Complaints */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-[#000080] dark:hover:border-blue-400 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <Layers size={14} className="text-[#000080] dark:text-blue-300" />
                    <span>Related Complaints</span>
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#000080] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {analysis.relatedComplaints} Reports Clustered
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {analysis.relatedComplaints > 1
                    ? `Correlated into hotspot cluster with ${analysis.relatedComplaints} citizen reports`
                    : 'Single isolated report logged in this ward sector'}
                </p>
              </div>

              {/* Factor 6: Location Sensitivity */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-[#138808] transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <MapPin size={14} className="text-[#138808]" />
                    <span>Location Sensitivity</span>
                  </span>
                  {getRatingBadge(analysis.locationSensitivity)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {analysis.locationSensitivityDetails || 'Public road, school, residential area, or transit hub'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendation Quote Box */}
          <div className="p-3.5 bg-gradient-to-r from-[#000080]/5 via-[#FF9933]/10 to-[#138808]/5 dark:from-blue-950/30 dark:via-amber-950/30 dark:to-emerald-950/30 rounded-xl border-l-4 border-[#000080] dark:border-blue-400 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#000080] dark:text-blue-300 uppercase tracking-wide">
              <Sparkles size={12} className="text-[#FF9933]" />
              <span>AI Recommendation:</span>
            </div>
            <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold italic leading-relaxed">
              "{analysis.aiRecommendation}"
            </p>
          </div>

          {/* Core System Principle Banner (Required by user prompt) */}
          <div className="p-2.5 bg-[#FFF6EC] dark:bg-amber-950/30 rounded-xl border border-[#FFD4A8] dark:border-amber-800/50 text-[11px] text-[#000080] dark:text-amber-200 flex items-start gap-2">
            <Scale size={15} className="text-[#E68A00] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-[#E68A00] block text-[10px] uppercase tracking-wider">
                Determination Principle:
              </strong>
              <p className="text-slate-700 dark:text-slate-300 leading-snug mt-0.5">
                Priority is determined by <strong>potential civic impact and urgency</strong>, NOT simply by the chronological order in which complaints were submitted.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
