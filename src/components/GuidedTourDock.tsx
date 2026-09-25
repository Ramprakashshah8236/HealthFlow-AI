import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { TOUR_STEPS } from '../data/tourData';

export const GuidedTourDock: React.FC = () => {
  const {
    activeTourStep,
    nextTourStep,
    prevTourStep,
    exitGuidedTour,
    setIsDemoGuideOpen,
    setActiveTab,
    setQuickAiPrompt,
    setIsAiDrawerOpen,
    loadDemoScenario,
    setBannerNotification,
  } = useApp();

  if (activeTourStep === null || activeTourStep === undefined) return null;

  const currentStep = TOUR_STEPS[activeTourStep] || TOUR_STEPS[0];
  const isFirst = activeTourStep === 0;
  const isLast = activeTourStep === TOUR_STEPS.length - 1;

  const handlePerformStepAction = () => {
    // Ensure we are on the current step's tab
    setActiveTab(currentStep.tab);

    // Contextual demo action based on step
    switch (currentStep.tab) {
      case 'dashboard':
        setBannerNotification('Command Center Triage: Notice Metro General (H1) with 6.5d runway on IV Saline.');
        break;
      case 'shortages':
        setBannerNotification('Shortage Prediction: Forecast model loaded. Adjust the Surge Multiplier slider to test demand shifts.');
        break;
      case 'substitutions':
        setBannerNotification('Clinical Substitutions: Select Ceftriaxone to examine Cefotaxime/Cefepime bioequivalent replacements.');
        break;
      case 'recalls':
        setBannerNotification('Recalls & Quarantine: Select Recall FDA-REC-2026-CLASS-I-084 to test network lot quarantine lockout.');
        break;
      case 'waste':
        setBannerNotification('Waste Intelligence: Memorial Hospital has 120 expiring diagnostic kits ($10,200 risk).');
        break;
      case 'redistribution':
        setBannerNotification('Smart Redistribution: Click "Manifest" or "Approve" to evaluate St. Jude → Metro General mutual aid.');
        break;
      case 'crisis':
        setBannerNotification('Crisis Lab: Set Disease Demand to +45% and click "Run Stress-Test Simulation".');
        break;
      case 'cold-chain':
        setBannerNotification('Cold-Chain IoT: Sensor SN-CC-004 reporting +8.4°C thermal excursion.');
        break;
      default:
        break;
    }
  };

  const handleAskAiAboutStep = () => {
    setQuickAiPrompt(
      `Provide an executive operational briefing for the ${currentStep.title} screen. What are the key indicators, risk thresholds, and standard actions a hospital director must execute here?`
    );
    setIsAiDrawerOpen(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div className="bg-slate-900/95 border border-teal-500/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl shadow-teal-950/40 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Step Info */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                  Step {currentStep.stepNumber} of {TOUR_STEPS.length}
                </span>
                <span className="text-xs font-bold text-white truncate">{currentStep.title}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Tab: <strong className="text-teal-300">{currentStep.tab.toUpperCase()}</strong>
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 line-clamp-1 sm:line-clamp-2">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <button
              onClick={handlePerformStepAction}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              title="Highlight current step demo focus"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Try This Step</span>
            </button>

            <button
              onClick={handleAskAiAboutStep}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              title="Ask Gemini about this step"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>

            <button
              onClick={prevTourStep}
              disabled={isFirst}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isFirst
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="Previous Step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextTourStep}
              className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-md transition-all"
            >
              <span>{isLast ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsDemoGuideOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Open Full Guide Modal"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={exitGuidedTour}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Exit Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Strip */}
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-teal-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep.stepNumber) / TOUR_STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
