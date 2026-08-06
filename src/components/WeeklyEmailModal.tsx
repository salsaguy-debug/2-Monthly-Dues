import React, { useState } from 'react';
import { SystemSettings, LedgerRow } from '../types';
import { X, Mail, Send, CheckCircle2, Sparkles, User, FileText, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WeeklyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  activePerformers: LedgerRow[];
}

export const WeeklyEmailModal: React.FC<WeeklyEmailModalProps> = ({
  isOpen,
  onClose,
  settings,
  activePerformers
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'performer' | 'executive'>('performer');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isOpen) return null;

  // Find delinquent performers
  const delinquentPerformers = activePerformers.filter(p => p.owesYear > 0);
  const samplePerformer = delinquentPerformers[0] || activePerformers[0] || {
    name: 'Mateo Silva',
    email: 'mateo.silva@tradicion.org',
    owesYear: 45.0
  };

  const totalOutstanding = activePerformers.reduce((acc, p) => acc + p.owesYear, 0);
  const totalPaid = activePerformers.reduce((acc, p) => acc + p.totalPaid2026, 0);

  const handleSimulateSend = () => {
    setIsSending(true);
    setSendSuccess(false);

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">
                {language === 'es' ? 'MOTOR AUTOMÁTICO DE ENVÍO DE CORREOS' : 'AUTOMATED EMAIL DISPATCH ENGINE'}
              </span>
              <h3 className="text-base font-extrabold text-slate-800">
                {t('weeklyEmailModalTitle')}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule Badge */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 mb-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>{language === 'es' ? 'Horario Activo:' : 'Active Schedule:'}</strong> {settings.WEEKLY_EMAIL_DAY || 'Every Monday @ 09:00 AM'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-white px-3 py-1 rounded-lg border border-indigo-200 text-indigo-700">
            <span>{language === 'es' ? 'Estado:' : 'Status:'}</span>
            <span className={settings.ENABLE_WEEKLY_EMAIL ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
              {settings.ENABLE_WEEKLY_EMAIL ? (language === 'es' ? '🟢 Habilitado' : '🟢 Enabled') : (language === 'es' ? '🔴 Deshabilitado' : '🔴 Disabled')}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mb-4 gap-2">
          <button
            onClick={() => setActiveTab('performer')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'performer'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Aviso Individual a Moroso' : 'Individual Delinquent Notice Sample'}</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {delinquentPerformers.length} {language === 'es' ? 'Integrantes' : 'Performers'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('executive')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'executive'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Financial Digest</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-mono">
              Treasurer
            </span>
          </button>
        </div>

        {/* Preview Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 font-sans">
          {activeTab === 'performer' ? (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start text-xs">
                <div>
                  <p className="text-slate-400">To: <span className="text-slate-800 font-semibold">{samplePerformer.email}</span></p>
                  <p className="text-slate-400">Subject: <span className="text-slate-900 font-bold">⚠️ Tradición Dues Reminder - Balance Due: ${samplePerformer.owesYear.toFixed(2)}</span></p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-1 rounded">HTML MailApp</span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>Hola <strong>{samplePerformer.name}</strong>,</p>
                <p>
                  This is an automated weekly notification regarding your <strong>Tradición Dance Ensemble</strong> dues statement for the 2026 season.
                </p>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Current Outstanding Balance</div>
                    <div className="text-xl font-extrabold text-rose-700 font-mono">${samplePerformer.owesYear.toFixed(2)}</div>
                  </div>
                  <div className="text-[11px] text-rose-600 font-medium text-right">
                    Includes Base Dues ($15/mo)<br />+ Weekly Late Fee Penalties
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Please remit payment at your earliest convenience to maintain active performer standing.
                </p>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-center gap-4 text-xs font-bold text-slate-700">
                  <span>🟣 Venmo: @TradicionSalsa</span>
                  <span>•</span>
                  <span>🟢 Cash App: $SalsaTradicion</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-3 text-xs">
                <p className="text-slate-400">To: <span className="text-slate-800 font-semibold">{settings.TREASURER_EMAIL || 'treasurer@tradicion.org'}</span></p>
                <p className="text-slate-400">Subject: <span className="text-slate-900 font-bold">📊 Tradición Executive Financial Digest - Weekly Report</span></p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <h4 className="font-extrabold text-indigo-900 text-sm border-b border-slate-100 pb-1">
                  Executive Dues Summary Digest
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Total YTD Revenue</div>
                    <div className="text-sm font-mono font-bold text-emerald-600">${totalPaid.toFixed(2)}</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Outstanding Debt</div>
                    <div className="text-sm font-mono font-bold text-rose-600">${totalOutstanding.toFixed(2)}</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Delinquent Dancers</div>
                    <div className="text-sm font-mono font-bold text-slate-800">{delinquentPerformers.length} / {activePerformers.length}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="font-bold text-slate-800 mb-2 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Delinquent Performers Breakdown:
                  </h5>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-[11px]">
                    {delinquentPerformers.map((dp, idx) => (
                      <div key={`weekly-email-${dp.email}-${idx}`} className="p-2 flex justify-between items-center bg-white hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-800">{dp.name}</span>
                          <span className="text-slate-400 ml-1.5 font-mono text-[10px]">({dp.email})</span>
                        </div>
                        <span className="font-mono font-bold text-rose-600">${dp.owesYear.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {sendSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Weekly email dispatch simulated successfully! Notices queued for {delinquentPerformers.length} delinquent performers + Treasurer digest.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Powered by Google Apps Script <code className="text-indigo-600 font-mono">MailApp.sendEmail()</code>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSimulateSend}
              disabled={isSending}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching MailApp...' : 'Simulate Immediate Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
