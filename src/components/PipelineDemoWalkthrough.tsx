import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Camera,
  Cpu,
  Flame,
  Route,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Building,
  Check,
  X,
  Volume2,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import { CivicCategory, PriorityLevel, CivicComplaint } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';

interface DemoScenario {
  name: string;
  badge: string;
  title: string;
  description: string;
  photoUrl: string;
  category: CivicCategory;
  specificProblem: string;
  impact: string;
  priority: PriorityLevel;
  hotspotName: string;
  relatedReportsCount: number;
  possibleRootCause: string;
  department: string;
  officer: string;
  slaHours: number;
}

const PRESET_SCENARIOS: DemoScenario[] = [
  {
    name: 'Scenario A: Drainage & Waterlogging Cluster',
    badge: 'CivicHotspot Trigger',
    title: 'Severe Waterlogging on Main Road',
    description:
      'Water has been standing near our street for 5 days and there is a bad smell. Vehicles are splashing dirty water into nearby residential homes.',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    specificProblem: 'Severe Waterlogging & Storm Drain Choke',
    impact: 'High hygiene concern, risk of vector-borne diseases, and vehicular obstruction',
    priority: 'HIGH',
    hotspotName: 'Main Road Ward 12 Drainage Cluster',
    relatedReportsCount: 4,
    possibleRootCause: 'Possible Root Cause: Severe silt accumulation in primary storm drain combined with choked culvert inlet.',
    department: 'Drainage & Sanitation Dept',
    officer: 'Er. Rajesh Verma (AEE - Ward 12)',
    slaHours: 48,
  },
  {
    name: 'Scenario B: Pothole & SLA Overdue Escalation',
    badge: 'Escalation Trigger',
    title: 'Deep Hazardous Crater Pothole on College Road',
    description:
      'Huge pothole almost 1.5 feet deep right in front of the college main gate. Multiple bike skids reported during evening peak.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road',
    specificProblem: 'Severe Crater Pothole',
    impact: 'High accident hazard, severe risk to two-wheelers and pedestrians',
    priority: 'HIGH',
    hotspotName: 'College Road Pedestrian Hazard Zone',
    relatedReportsCount: 3,
    possibleRootCause: 'Possible Root Cause: Underground water seepage weakening road sub-base combined with heavy bus traffic.',
    department: 'Roads & Infrastructure Directorate',
    officer: 'Asst. Eng. Anita Sharma',
    slaHours: 48,
  },
  {
    name: 'Scenario C: Ruptured Water Main (Potable Loss)',
    badge: 'Fast-Track SLA',
    title: 'Broken Potable Water Pipeline Gushing',
    description:
      'Fresh treated drinking water has been bursting onto the pedestrian path for 12 hours. Massive clean water loss.',
    photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    specificProblem: 'Drinking Water Pipeline Burst',
    impact: 'Massive clean drinking water loss and low pressure in residential colony',
    priority: 'HIGH',
    hotspotName: 'Isolated Pipeline Defect',
    relatedReportsCount: 1,
    possibleRootCause: 'Possible Root Cause: High distribution line pressure surge on aged cast-iron piping.',
    department: 'Water Supply & Sewerage Board',
    officer: 'M. Venkatesh (AE - Water Supply)',
    slaHours: 24,
  },
];

const PIPELINE_STEPS = [
  { num: '01', key: 'capture', name: 'CivicCapture', desc: 'Capture. Locate. Report.' },
  { num: '02', key: 'issuesense', name: 'IssueSense', desc: 'Understand. Classify. Organize.' },
  { num: '03', key: 'priority', name: 'SmartPriority', desc: 'Impact + Urgency + Context.' },
  { num: '04', key: 'hotspot', name: 'CivicHotspot', desc: 'Detect Correlated Clusters.' },
  { num: '05', key: 'rootcause', name: 'Root Cause Insight', desc: 'Possible Underlying Cause.' },
  { num: '06', key: 'route', name: 'SmartRoute', desc: 'Route. Assign. Track.' },
  { num: '07', key: 'escalate', name: 'Escalate', desc: 'Alert. Review. Escalate.' },
  { num: '08', key: 'verify', name: 'CitizenVerify', desc: 'Verify. Confirm. Reopen.' },
];

export const PipelineDemoWalkthrough: React.FC = () => {
  const { setCurrentView, setSelectedComplaint, complaints } = useCivic();

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [verifiedChoice, setVerifiedChoice] = useState<'yes' | 'no' | null>(null);

  const scenario = PRESET_SCENARIOS[activeScenarioIdx];

  const handleNextStep = () => {
    if (currentStepIdx < PIPELINE_STEPS.length - 1) {
      setCurrentStepIdx(idx => idx + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(idx => idx - 1);
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Banner */}
      <div className="bg-[#000080] text-white p-4 rounded-2xl shadow-md space-y-2 border border-white/20 relative overflow-hidden">
        {/* Subtle Indian Tricolour accent bar */}
        <div className="h-1 w-20 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-1" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white text-[#000080] font-black flex items-center justify-center text-xs shadow-xs">
              8x
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                SARVAYA End-to-End Intelligence Pipeline
              </h1>
              <p className="text-[11px] text-blue-100">
                Interactive demonstration of the complete 8-feature civic lifecycle
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#FF9933]/25 text-[#FFD4A8] px-2.5 py-1 rounded-full border border-[#FF9933]/40">
            Challenge Demo
          </span>
        </div>

        {/* Scenario Selector */}
        <div className="pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
            Select Test Scenario:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {PRESET_SCENARIOS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveScenarioIdx(idx);
                  setCurrentStepIdx(0);
                  setVerifiedChoice(null);
                }}
                className={`p-2 rounded-xl text-left transition border text-xs font-semibold ${
                  activeScenarioIdx === idx
                    ? 'bg-[#FF9933] text-[#000080] font-extrabold border-white/40 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100 border-white/10'
                }`}
              >
                <div className="text-[10px] opacity-80 font-normal">{s.badge}</div>
                <div className="truncate">{s.name.split(':')[1] || s.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 py-1">
          {PIPELINE_STEPS.map((step, idx) => (
            <button
              key={step.key}
              onClick={() => setCurrentStepIdx(idx)}
              className={`flex flex-col items-center min-w-[70px] px-1.5 py-1 rounded-xl transition ${
                currentStepIdx === idx
                  ? 'bg-[#000080] text-white font-bold shadow-xs ring-2 ring-[#FF9933]/50'
                  : currentStepIdx > idx
                  ? 'text-[#138808] dark:text-emerald-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="text-[10px] font-mono leading-none">
                {currentStepIdx > idx ? '✓' : step.num}
              </span>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {step.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE STEP CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Step Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0878C9]/10 text-[#0878C9] dark:text-blue-400 font-black flex items-center justify-center text-sm">
              {PIPELINE_STEPS[currentStepIdx].num}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0878C9] dark:text-blue-400">
                Intelligence Workflow • Step {PIPELINE_STEPS[currentStepIdx].num} of 8
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans'] leading-tight">
                {PIPELINE_STEPS[currentStepIdx].name}
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 italic">
            “{PIPELINE_STEPS[currentStepIdx].desc}”
          </span>
        </div>

        {/* STEP 01: CivicCapture */}
        {currentStepIdx === 0 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-1">
              <span className="text-[10px] font-bold text-[#0878C9] dark:text-blue-400 uppercase">
                Step 1: Citizen Mobile Capture
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                Citizen uses <strong>CivicCapture</strong> to register geotagged photo, audio notes, and location.
              </p>
              <div className="mt-1 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                Supports: <strong>Capture Now / Save Draft</strong> vs <strong>Submit Report</strong>.
              </div>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 relative">
              <img src={scenario.photoUrl} alt={scenario.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                <MapPin size={11} className="text-[#2E9B63]" />
                <span>17.4435° N, 78.3842° E (Main Road Ward 12)</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Citizen Input Text:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 italic mt-0.5">"{scenario.description}"</p>
            </div>
          </div>
        )}

        {/* STEP 02: IssueSense */}
        {currentStepIdx === 1 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">
                IssueSense — Intelligent Classification
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                SARVAYA converts the unstructured citizen complaint into a structured civic issue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Identified Category:</span>
                <span className="font-extrabold text-[#0878C9] dark:text-blue-400 text-sm">{scenario.category}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Specific Problem:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{scenario.specificProblem}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Civic Impact:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{scenario.impact}</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 font-medium">
              ✓ Unstructured text converted into structured civic classification data.
            </div>
          </div>
        )}

        {/* STEP 03: SmartPriority */}
        {currentStepIdx === 2 && (() => {
          const scenarioComplaint: CivicComplaint = {
            id: `DEMO-SRV-${activeScenarioIdx + 1}`,
            title: scenario.title,
            description: scenario.description,
            photoUrl: scenario.photoUrl,
            category: scenario.category,
            specificProblem: scenario.specificProblem,
            impact: scenario.impact,
            location: {
              address: 'College Road / Main Corridor',
              landmark: 'Near Govt Degree College Gate',
              ward: 'Ward 12',
              city: 'Vizianagaram',
              lat: 18.1224,
              lng: 83.4042,
            },
            isDraft: false,
            capturedAt: '2026-10-02 08:30 AM',
            priority: scenario.priority,
            priorityFactors: {
              severity: 'High impact civic hazard',
              peopleAffected: 'High commuter volume',
              duration: '3 days',
              recurrence: `${scenario.relatedReportsCount} reports in area`,
              publicHealthImpact: 'Evaluated',
              safetyImpact: 'Evaluated',
              relatedComplaintsCount: scenario.relatedReportsCount,
            },
            department: scenario.department,
            officerName: scenario.officer,
            officerContact: '+91 94401 23456',
            slaDays: scenario.slaHours / 24,
            targetResolutionDate: '2026-10-04 08:30 AM',
            status: 'In Progress',
            timelineEvents: [],
          };

          return (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className="p-3 bg-[#FFF6EC] dark:bg-amber-950/30 rounded-2xl border border-[#FFD4A8] dark:border-amber-800/50">
                <span className="text-[10px] font-extrabold text-[#E68A00] dark:text-amber-400 uppercase block">
                  Step 3: SmartPriority — Explainable 6-Factor Priority Engine
                </span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  Priority is calculated dynamically by evaluating: <strong>Safety Risk + People Affected + Duration + Public Health + Related Reports + Location Sensitivity</strong>. Not chronological FIFO arrival!
                </p>
              </div>

              <SmartPriorityAnalysisCard complaint={scenarioComplaint} defaultExpanded={true} />
            </div>
          );
        })()}

        {/* STEP 04: CivicHotspot */}
        {currentStepIdx === 3 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-red-50/70 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60">
              <span className="text-[10px] font-bold text-[#D64545] dark:text-red-400 uppercase block">
                CivicHotspot — Geospatial Cluster Detection
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                Instead of treating this as an isolated complaint, SARVAYA correlates 4 reports from the same locality!
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 rounded-2xl border-2 border-red-300 dark:border-red-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame size={18} className="text-[#D64545] animate-pulse" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{scenario.hotspotName}</span>
                </div>
                <span className="text-xs font-black text-[#D64545] dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                  {scenario.relatedReportsCount} Linked Reports
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Correlated Reports: (1) Stagnant water • (2) Blocked drain • (3) Mosquitoes • (4) Bad smell & overflow.
              </p>
            </div>
          </div>
        )}

        {/* STEP 05: Root Cause Insight */}
        {currentStepIdx === 4 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800/60">
              <span className="text-[10px] font-bold text-[#b97816] dark:text-amber-400 uppercase block">
                Root Cause Insight — Pattern Analysis
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                SARVAYA analyzes connected reports and suggests a <strong>POSSIBLE</strong> underlying cause.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-600 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#b97816] dark:text-amber-400 block">
                AI Suggestion (Mandatory Phrasing Rule):
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 italic leading-snug">
                "{scenario.possibleRootCause}"
              </p>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                * Presented strictly as a "Possible Root Cause" to assist engineers without claiming a guaranteed diagnosis.
              </div>
            </div>
          </div>
        )}

        {/* STEP 06: SmartRoute */}
        {currentStepIdx === 5 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60">
              <span className="text-[10px] font-bold text-[#0878C9] dark:text-blue-400 uppercase block">
                SmartRoute — Department Dispatch
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                Issue dispatched directly to responsible department & officer with a department-defined SLA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Responsible Dept:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{scenario.department}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Assigned Officer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{scenario.officer}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Action Timeline (SLA):</span>
                  <span className="font-extrabold text-[#0878C9] dark:text-blue-400 text-sm">{scenario.slaHours} Hours Defined SLA</span>
                </div>
                <span className="text-xs font-bold text-[#2E9B63] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  Status: Assigned → In Progress
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 07: Escalate */}
        {currentStepIdx === 6 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-red-50/70 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60">
              <span className="text-[10px] font-bold text-[#D64545] dark:text-red-400 uppercase block">
                Escalate — Accountability & Overdue Alerts
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                If the defined timeline is crossed without resolution, status shifts to <strong>OVERDUE</strong> and escalates to Higher Authority.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-300 dark:border-red-900/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#D64545] dark:text-red-400 font-bold">OVERDUE DETECTED</span>
                <span className="text-[10px] font-bold bg-[#D64545] text-white px-2 py-0.5 rounded-full">
                  Alert Forwarded
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Alert sent to <strong>Dr. S. K. Narayanan (Joint Municipal Commissioner)</strong>.
              </p>
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900/60 text-red-950 dark:text-red-200 font-medium italic">
                Directive #DIR-402: Emergency desilting suction deployed. 24-hour compliance mandated.
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              * SARVAYA provides monitoring, visibility and an escalation/accountability trail.
            </div>
          </div>
        )}

        {/* STEP 08: CitizenVerify */}
        {currentStepIdx === 7 && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-[10px] font-bold text-[#2E9B63] dark:text-emerald-400 uppercase block">
                CitizenVerify — Ground Verification
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                When authority marks Resolved, SARVAYA does <strong>NOT</strong> auto-close! Citizen must verify on the ground.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 space-y-3">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Department Status:</span>
                <div className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  "Drainage Desilting Completed — Marked Resolved by Officer"
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block mb-2">
                  Citizen, please check location: Is the problem resolved?
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVerifiedChoice('yes')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      verifiedChoice === 'yes'
                        ? 'bg-[#2E9B63] text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[#2E9B63] border border-[#2E9B63]'
                    }`}
                  >
                    <Check size={14} />
                    <span>YES — Resolved</span>
                  </button>

                  <button
                    onClick={() => setVerifiedChoice('no')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      verifiedChoice === 'no'
                        ? 'bg-[#D64545] text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 text-[#D64545] border border-[#D64545]'
                    }`}
                  >
                    <X size={14} />
                    <span>NO — Reopen</span>
                  </button>
                </div>
              </div>

              {verifiedChoice && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold animate-fadeIn ${
                    verifiedChoice === 'yes'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
                  }`}
                >
                  {verifiedChoice === 'yes' ? (
                    <div>
                      ✓ <strong>Citizen Confirmed: YES.</strong> Complaint is formally closed with citizen consensus and audit log completed!
                    </div>
                  ) : (
                    <div>
                      ⚠ <strong>Citizen Flagged: NO.</strong> Ticket immediately <strong>REOPENED</strong> and routed back to Department Superintending Engineer!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition ${
              currentStepIdx === 0
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-bold">
            Step {currentStepIdx + 1} of {PIPELINE_STEPS.length}
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStepIdx === PIPELINE_STEPS.length - 1}
            className={`flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl text-white transition ${
              currentStepIdx === PIPELINE_STEPS.length - 1
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                : 'bg-[#000080] hover:bg-[#000060] shadow-sm border border-[#FF9933]/50'
            }`}
          >
            <span>Next Feature</span>
            <ChevronRight size={16} className="text-[#FF9933]" />
          </button>
        </div>
      </div>
    </div>
  );
};
