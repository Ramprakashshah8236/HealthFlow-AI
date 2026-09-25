import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BannerNotification } from './components/BannerNotification';
import { DashboardView } from './components/DashboardView';
import { SupplyIntelligenceView } from './components/SupplyIntelligenceView';
import { ShortagePredictionView } from './components/ShortagePredictionView';
import { WasteIntelligenceView } from './components/WasteIntelligenceView';
import { SmartRedistributionView } from './components/SmartRedistributionView';
import { CrisisLabView } from './components/CrisisLabView';
import { NetworkMapView } from './components/NetworkMapView';
import { ColdChainView } from './components/ColdChainView';
import { SubstitutionsView } from './components/SubstitutionsView';
import { RecallsQuarantineView } from './components/RecallsQuarantineView';
import { HospitalDetailModal } from './components/HospitalDetailModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { SecretsStatusModal } from './components/SecretsStatusModal';
import { RealDataIngestionModal } from './components/RealDataIngestionModal';
import { TransferManifestModal } from './components/TransferManifestModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import { GuidedTourDock } from './components/GuidedTourDock';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'supplies' && <SupplyIntelligenceView />}
      {activeTab === 'shortages' && <ShortagePredictionView />}
      {activeTab === 'substitutions' && <SubstitutionsView />}
      {activeTab === 'recalls' && <RecallsQuarantineView />}
      {activeTab === 'waste' && <WasteIntelligenceView />}
      {activeTab === 'redistribution' && <SmartRedistributionView />}
      {activeTab === 'crisis' && <CrisisLabView />}
      {activeTab === 'network' && <NetworkMapView />}
      {activeTab === 'cold-chain' && <ColdChainView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
        <Navbar />
        <BannerNotification />
        
        <div className="flex-1">
          <MainContent />
        </div>

        <HospitalDetailModal />
        <AiAssistantDrawer />
        <RoleSwitchModal />
        <AccessDeniedModal />
        <SecurityAuditModal />
        <SecretsStatusModal />
        <RealDataIngestionModal />
        <TransferManifestModal />
        <DemoGuideModal />
        <GuidedTourDock />

        {/* Professional Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span className="font-semibold text-slate-400">HealthFlow AI Platform</span>
              <span>— Synthetic Healthcare Operations Prototype</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-500">
              <span>ISO 13485 &amp; HIPAA De-Identified Compliant Synthetic Dataset</span>
              <span>•</span>
              <span>Server-Side Gemini 2.5 Intelligence Engine</span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
