import React, { useState, useMemo, useEffect } from 'react';
import { Mail, CloudDownload, Trash2, CheckCircle, Database } from 'lucide-react';
import { SystemSettings, PaymentRecord, MatchStatus, RawPerformer, WidgetType } from './types';
import { DEFAULT_SETTINGS, INITIAL_PAYMENTS, MASTER_ROSTER } from './data/defaultData';
import { calculateAccountingState } from './utils/accountingEngine';
import { fetchRealDataFromAppsScript, getSavedAppsScriptUrl } from './services/appsScriptService';
import { Header } from './components/Header';
import { BentoDashboard } from './components/BentoDashboard';
import { LedgerView } from './components/LedgerView';
import { PaymentRecordsView } from './components/PaymentRecordsView';
import { SettingsView } from './components/SettingsView';
import { CodeDiagnosticsView } from './components/CodeDiagnosticsView';
import { AddPaymentModal } from './components/AddPaymentModal';
import { WeeklyEmailModal } from './components/WeeklyEmailModal';
import { DataManagementModal } from './components/DataManagementModal';
import { GmailSyncModal } from './components/GmailSyncModal';
import { LoadRealDataModal } from './components/LoadRealDataModal';
import { EditPerformerModal } from './components/EditPerformerModal';
import { EditPaymentModal } from './components/EditPaymentModal';
import { DebtCollectionModal } from './components/DebtCollectionModal';
import { PerformerDetailView } from './components/PerformerDetailView';
import { UserGuideModal } from './components/UserGuideModal';
import { ExcludedPerformersModal } from './components/ExcludedPerformersModal';
import { WidgetModal } from './components/WidgetModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'payments' | 'performers' | 'settings' | 'diagnostics'>('dashboard');
  
  // LocalStorage state initialization
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('tradicion_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      if (localStorage.getItem('tradicion_cleared') === 'true') {
        return [];
      }
      const saved = localStorage.getItem('tradicion_payments');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [roster, setRoster] = useState<RawPerformer[]>(() => {
    try {
      if (localStorage.getItem('tradicion_cleared') === 'true') {
        return [];
      }
      const saved = localStorage.getItem('tradicion_roster');
      if (saved) {
        return JSON.parse(saved);
      }
      return MASTER_ROSTER;
    } catch {
      return MASTER_ROSTER;
    }
  });

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isWeeklyEmailModalOpen, setIsWeeklyEmailModalOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isGmailSyncOpen, setIsGmailSyncOpen] = useState(false);
  const [isLoadRealDataOpen, setIsLoadRealDataOpen] = useState(false);
  const [isDebtCollectionOpen, setIsDebtCollectionOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isExcludedPerformersOpen, setIsExcludedPerformersOpen] = useState(false);
  const [widgetModalType, setWidgetModalType] = useState<WidgetType | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit Modals state
  const [editingPerformer, setEditingPerformer] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tradicion_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('tradicion_payments', JSON.stringify(payments));
    } catch (e) {
      console.error(e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem('tradicion_roster', JSON.stringify(roster));
    } catch (e) {
      console.error(e);
    }
  }, [roster]);

  // Helper functions to merge local and remote data without overwriting local changes
  const mergePaymentsData = (local: PaymentRecord[], remote: PaymentRecord[]): PaymentRecord[] => {
    const map = new Map<string, PaymentRecord>();
    for (const p of remote) {
      if (p && p.id) map.set(p.id, p);
    }
    // Local records take precedence to preserve local additions and edits
    for (const p of local) {
      if (p && p.id) map.set(p.id, p);
    }
    return Array.from(map.values());
  };

  const mergeRosterData = (local: RawPerformer[], remote: RawPerformer[]): RawPerformer[] => {
    const map = new Map<string, RawPerformer>();
    for (const r of remote) {
      if (r && r.email) map.set(r.email.toLowerCase().trim(), r);
    }
    for (const r of local) {
      if (r && r.email) map.set(r.email.toLowerCase().trim(), r);
    }
    return Array.from(map.values());
  };

  // Auto-sync from Google Sheets on startup if Google Apps Script URL is saved
  useEffect(() => {
    const savedUrl = getSavedAppsScriptUrl();
    if (savedUrl) {
      setIsSyncing(true);
      fetchRealDataFromAppsScript(savedUrl)
        .then(result => {
          if (result.success && (result.roster.length > 0 || result.payments.length > 0)) {
            setRoster(prev => mergeRosterData(prev, result.roster));
            setPayments(prev => mergePaymentsData(prev, result.payments));
            localStorage.removeItem('tradicion_cleared');
          }
        })
        .catch(err => console.error('Auto-load from Google Sheets failed on mount:', err))
        .finally(() => setIsSyncing(false));
    }
  }, []);

  const [syncVersion, setSyncVersion] = useState(0);

  // Pure In-Memory Accounting Calculation with Custom Roster
  const accountingState = useMemo(() => {
    return calculateAccountingState(settings, payments, roster);
  }, [settings, payments, roster, syncVersion]);

  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setPayments(INITIAL_PAYMENTS);
    setRoster(MASTER_ROSTER);
    localStorage.removeItem('tradicion_cleared');
    localStorage.setItem('tradicion_settings', JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem('tradicion_payments', JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem('tradicion_roster', JSON.stringify(MASTER_ROSTER));
  };

  const handleResetAllData = () => {
    setSettings(DEFAULT_SETTINGS);
    setPayments([]);
    setRoster([]);
    localStorage.setItem('tradicion_settings', JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem('tradicion_payments', JSON.stringify([]));
    localStorage.setItem('tradicion_roster', JSON.stringify([]));
    localStorage.setItem('tradicion_cleared', 'true');
  };

  const handleClearAllData = () => {
    setPayments([]);
    setRoster([]);
    localStorage.setItem('tradicion_payments', JSON.stringify([]));
    localStorage.setItem('tradicion_roster', JSON.stringify([]));
    localStorage.setItem('tradicion_cleared', 'true');
  };

  // Load Real Data handler that replaces/updates app state from Google Apps Script backend
  const handleApplyRealData = (newRoster: RawPerformer[], newPayments: PaymentRecord[]) => {
    localStorage.removeItem('tradicion_cleared');
    if (newRoster && newRoster.length > 0) {
      setRoster(prev => mergeRosterData(prev, newRoster));
    }
    if (newPayments && newPayments.length > 0) {
      setPayments(prev => mergePaymentsData(prev, newPayments));
    }
    setSyncVersion(v => v + 1);
  };

  const handleAddPayment = (newPayment: PaymentRecord) => {
    localStorage.removeItem('tradicion_cleared');
    setPayments(prev => [newPayment, ...prev]);
  };

  // Automated Callback mechanism triggering instant re-fetch/re-calculation of accountingState
  const handleAddSyncedPayments = (newPayments: PaymentRecord[]) => {
    localStorage.removeItem('tradicion_cleared');
    setPayments(prev => [...newPayments, ...prev]);
    setSyncVersion(v => v + 1);
  };

  const handleUpdatePaymentStatus = (id: string, newStatus: MatchStatus, newEmail?: string) => {
    localStorage.removeItem('tradicion_cleared');

    let matchedName: string | undefined;
    if (newEmail) {
      const found = roster.find(r => r.email.toLowerCase().trim() === newEmail.toLowerCase().trim());
      if (found && found.name) {
        matchedName = found.name;
      }
    }

    setPayments(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updatedEmail = newEmail ? newEmail.toLowerCase().trim() : p.email;
          const updatedName = (matchedName && (p.payerName === 'Unmatched Payer' || !p.payerName))
            ? matchedName
            : p.payerName;
          return {
            ...p,
            matchStatus: newStatus,
            email: updatedEmail,
            payerName: updatedName
          };
        }
        return p;
      })
    );
  };

  const handleSavePerformer = (oldEmail: string, updated: { name: string; email: string; phone?: string }) => {
    localStorage.removeItem('tradicion_cleared');
    setRoster(prev => {
      const exists = prev.some(p => p.email.toLowerCase() === oldEmail.toLowerCase());
      if (exists) {
        return prev.map(p => p.email.toLowerCase() === oldEmail.toLowerCase() ? { ...p, ...updated } : p);
      } else {
        return [...prev, updated];
      }
    });

    // If email changed, update existing payment records
    if (oldEmail.toLowerCase() !== updated.email.toLowerCase()) {
      setPayments(prev => prev.map(p => p.email.toLowerCase() === oldEmail.toLowerCase() ? { ...p, email: updated.email.toLowerCase() } : p));
    }
  };

  const handleDeletePerformer = (email: string) => {
    localStorage.removeItem('tradicion_cleared');
    const target = (email || '').toLowerCase().trim();
    setRoster(prev => prev.filter(p => (p.email || '').toLowerCase().trim() !== target));
  };

  const handleSavePayment = (updated: PaymentRecord) => {
    setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const handleTriggerDailySync = async () => {
    setIsSyncing(true);
    const savedUrl = getSavedAppsScriptUrl();
    if (savedUrl) {
      try {
        const result = await fetchRealDataFromAppsScript(savedUrl);
        if (result.success && (result.roster.length > 0 || result.payments.length > 0)) {
          setRoster(prev => mergeRosterData(prev, result.roster));
          setPayments(prev => mergePaymentsData(prev, result.payments));
          localStorage.removeItem('tradicion_cleared');
        }
      } catch (e) {
        console.error('Daily sync error:', e);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 600));
      setPayments([...payments]);
    }
    setIsSyncing(false);
  };

  const activePerformersList = accountingState.activePerformers.map(p => ({
    name: p.name,
    email: p.email
  }));

  const activePerformersEmails = activePerformersList.map(p => p.email);

  return (
    <div className="bg-[#F1F3F5] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full flex-grow">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          executionTimeMs={accountingState.executionTimeMs}
          onOpenAddPayment={() => setIsAddPaymentOpen(true)}
          onTriggerDailySync={handleTriggerDailySync}
          isSyncing={isSyncing}
          onOpenWeeklyEmailPreview={() => setIsWeeklyEmailModalOpen(true)}
          onOpenDataManagement={() => setIsDataManagementOpen(true)}
          onOpenGmailSync={() => setIsGmailSyncOpen(true)}
          onOpenLoadRealData={() => setIsLoadRealDataOpen(true)}
          onClearAllData={handleClearAllData}
          onResetBaselineData={handleResetDefaults}
          onOpenDebtCollection={() => setIsDebtCollectionOpen(true)}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
          onOpenExcludedPerformers={() => setIsExcludedPerformersOpen(true)}
          onOpenWidgetModal={(widget) => setWidgetModalType(widget)}
        />

        {/* Live Workspace Empty State / Quick Sync Banner */}
        {roster.length === 0 && payments.length === 0 && (
          <div className="mt-4 p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> Live Data Mode Active
                </span>
                <h3 className="text-base font-black text-white">All Test Data Purged</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                All sample performers (@tradicion.org) and mock payments have been removed. Your workspace is clean and ready for real data.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsGmailSyncOpen(true)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Sync Live Gmail Payments</span>
              </button>
              <button
                onClick={() => setIsLoadRealDataOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CloudDownload className="w-4 h-4 text-emerald-300" />
                <span>Load Real GAS / CSV Roster</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Views */}
        <main className="mt-2 pb-8">
          {activeTab === 'dashboard' && (
            <BentoDashboard
              kpis={accountingState.kpis}
              settings={settings}
              executionTimeMs={accountingState.executionTimeMs}
              activePerformers={accountingState.activePerformers}
              payments={payments}
              onNavigateTab={setActiveTab}
              onEditPerformer={setEditingPerformer}
              onOpenWidgetModal={(widget) => setWidgetModalType(widget)}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerView
              ledgerRows={accountingState.ledgerRows}
              activePerformers={accountingState.activePerformers}
              excludedPerformers={accountingState.excludedPerformers}
              onEditPerformer={setEditingPerformer}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentRecordsView
              payments={payments}
              onOpenAddPayment={() => setIsAddPaymentOpen(true)}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              activePerformersEmails={activePerformersEmails}
              onOpenGmailSync={() => setIsGmailSyncOpen(true)}
              onEditPayment={setEditingPayment}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {activeTab === 'performers' && (
            <PerformerDetailView
              activePerformers={accountingState.activePerformers}
              payments={payments}
              settings={settings}
              onEditPerformer={setEditingPerformer}
              onOpenAddPayment={() => setIsAddPaymentOpen(true)}
              onOpenDebtCollection={() => setIsDebtCollectionOpen(true)}
              onEditPayment={setEditingPayment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetDefaults={handleResetDefaults}
              onOpenWeeklyEmailPreview={() => setIsWeeklyEmailModalOpen(true)}
            />
          )}

          {activeTab === 'diagnostics' && (
            <CodeDiagnosticsView />
          )}
        </main>
      </div>

      {/* Bento Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className="font-bold uppercase hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Code.gs Source
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className="font-bold uppercase hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Implementation Plan
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className="font-bold uppercase hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Walkthrough.md
          </button>
        </div>

        <div className="font-mono text-[10px] text-slate-500">
          Build: 2026.04.01-ALPHA • Tradición Financial System 7.0.0
        </div>
      </footer>

      {/* Record Payment Intake Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        onAddPayment={handleAddPayment}
        activePerformers={activePerformersList}
      />

      {/* Weekly Email Preview & Test Dispatch Modal */}
      <WeeklyEmailModal
        isOpen={isWeeklyEmailModalOpen}
        onClose={() => setIsWeeklyEmailModalOpen(false)}
        settings={settings}
        activePerformers={accountingState.activePerformers}
      />

      {/* Real Data & CSV Manager Modal */}
      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
        roster={roster}
        onUpdateRoster={setRoster}
        payments={payments}
        onUpdatePayments={setPayments}
        onResetAllData={handleResetAllData}
        onClearAllData={handleClearAllData}
        onOpenLoadRealDataModal={() => setIsLoadRealDataOpen(true)}
      />

      {/* Load Real Data Guided Wizard Modal */}
      <LoadRealDataModal
        isOpen={isLoadRealDataOpen}
        onClose={() => setIsLoadRealDataOpen(false)}
        onApplyRealData={handleApplyRealData}
        currentRosterCount={roster.length}
        currentPaymentsCount={payments.length}
      />

      {/* Automated Gmail Intake Sync Modal */}
      <GmailSyncModal
        isOpen={isGmailSyncOpen}
        onClose={() => setIsGmailSyncOpen(false)}
        roster={roster}
        payments={payments}
        onAddSyncedPayments={handleAddSyncedPayments}
        onViewPaymentRecords={() => setActiveTab('payments')}
        onClearAllData={handleClearAllData}
      />

      {/* Edit / Correct Performer Information Modal */}
      <EditPerformerModal
        isOpen={Boolean(editingPerformer)}
        onClose={() => setEditingPerformer(null)}
        performer={editingPerformer}
        onSave={handleSavePerformer}
        onDelete={handleDeletePerformer}
      />

      {/* Edit / Correct Payment Record Modal */}
      <EditPaymentModal
        isOpen={Boolean(editingPayment)}
        onClose={() => setEditingPayment(null)}
        payment={editingPayment}
        activePerformersEmails={activePerformersEmails}
        onSave={handleSavePayment}
        onDelete={handleDeletePayment}
      />

      {/* Debt Collection & Recovery Modal */}
      <DebtCollectionModal
        isOpen={isDebtCollectionOpen}
        onClose={() => setIsDebtCollectionOpen(false)}
        activePerformers={accountingState.activePerformers}
        onAddPayment={handleAddPayment}
        debtCollectionFee={settings.DEBT_COLLECTION_FEE || 15.0}
      />

      {/* Illustrated User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

      {/* Excluded Performers Manager Modal */}
      <ExcludedPerformersModal
        isOpen={isExcludedPerformersOpen}
        onClose={() => setIsExcludedPerformersOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        roster={roster}
      />

      {/* Interactive Widget Popup Modal */}
      <WidgetModal
        isOpen={Boolean(widgetModalType)}
        widgetType={widgetModalType}
        onClose={() => setWidgetModalType(null)}
        kpis={accountingState.kpis}
        settings={settings}
        executionTimeMs={accountingState.executionTimeMs}
        activePerformers={accountingState.activePerformers}
        payments={payments}
        onSelectWidget={(widget) => setWidgetModalType(widget)}
      />
    </div>
  );
}
