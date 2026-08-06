import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { formatCurrency, MONTH_NAMES } from '../utils/dateUtils';
import { 
  Settings, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Sliders, 
  Clock, 
  DollarSign,
  Mail,
  Eye
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onResetDefaults: () => void;
  onOpenWeeklyEmailPreview?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
  onOpenWeeklyEmailPreview
}) => {
  const { language, t } = useLanguage();
  const [formSettings, setFormSettings] = useState<SystemSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-save settings on change so field values are never lost
  useEffect(() => {
    onSaveSettings({
      ...formSettings,
      EXCLUDED_PERFORMERS: settings.EXCLUDED_PERFORMERS
    });
  }, [formSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...formSettings,
      EXCLUDED_PERFORMERS: settings.EXCLUDED_PERFORMERS
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    onResetDefaults();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              {t('settingsTitle')}
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">
              {t('settingsTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('settingsSub')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {language === 'es' ? 'Restablecer' : 'Reset Defaults'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'es' ? '¡Configuración actualizada exitosamente! Todos los saldos fueron recalculados.' : 'Settings successfully updated! All accounting ledger balances recalculated.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Base Monthly Dues */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Base Monthly Dues (BASE_DUES)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Monthly charge per active performer ($)
              </p>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formSettings.BASE_DUES}
                onChange={e => setFormSettings({ ...formSettings, BASE_DUES: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Dues Start Month */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Dues Start Month (DUES_START_MONTH)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Dues start month index (0 = Jan, 3 = April)
              </p>
              <select
                value={formSettings.DUES_START_MONTH}
                onChange={e => setFormSettings({ ...formSettings, DUES_START_MONTH: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {idx + 1} - {name} 2026 {idx === 3 ? '(Default: April)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Late Fee Weekly Penalty */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Late Fee Weekly Penalty (LATE_FEE_WEEKLY)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Penalty added per week overdue ($)
              </p>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formSettings.LATE_FEE_WEEKLY}
                onChange={e => setFormSettings({ ...formSettings, LATE_FEE_WEEKLY: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Max Monthly Late Fee Cap */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Max Monthly Late Fee Cap (MAX_LATE_FEE)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Maximum late fee cap per month ($)
              </p>
              <input
                type="number"
                step="1"
                min="0"
                value={formSettings.MAX_LATE_FEE}
                onChange={e => setFormSettings({ ...formSettings, MAX_LATE_FEE: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Nightly Sync Trigger Time */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Nightly Trigger Schedule (SYNC_TRIGGER_TIME)
              </label>
              <p className="text-[11px] text-slate-500">
                Automated Gmail intake & ledger sync time
              </p>
            </div>
            <input
              type="text"
              value={formSettings.SYNC_TRIGGER_TIME}
              onChange={e => setFormSettings({ ...formSettings, SYNC_TRIGGER_TIME: e.target.value })}
              className="p-2.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl w-36"
            />
          </div>

          {/* Weekly Email Notification Dispatch Settings */}
          <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-indigo-100">
              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Automated Weekly Email Dispatch Engine (ENABLE_WEEKLY_EMAIL)
                </label>
                <p className="text-[11px] text-slate-500">
                  Sends weekly dues statement notices to delinquent performers & executive summary digest to Treasurer.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {onOpenWeeklyEmailPreview && (
                  <button
                    type="button"
                    onClick={onOpenWeeklyEmailPreview}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Preview Weekly Email</span>
                  </button>
                )}

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.ENABLE_WEEKLY_EMAIL}
                    onChange={e => setFormSettings({ ...formSettings, ENABLE_WEEKLY_EMAIL: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Dispatch Schedule Day
                </label>
                <input
                  type="text"
                  value={formSettings.WEEKLY_EMAIL_DAY}
                  onChange={e => setFormSettings({ ...formSettings, WEEKLY_EMAIL_DAY: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl"
                  placeholder="Every Monday @ 09:00 AM"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Recipient Dispatch Scope
                </label>
                <select
                  value={formSettings.WEEKLY_EMAIL_RECIPIENT_SCOPE}
                  onChange={e => setFormSettings({ ...formSettings, WEEKLY_EMAIL_RECIPIENT_SCOPE: e.target.value as any })}
                  className="w-full p-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl"
                >
                  <option value="DELINQUENT_PERFORMERS_AND_TREASURER">Dancers + Treasurer Digest</option>
                  <option value="TREASURER_EXECUTIVE_ONLY">Treasurer Digest Only</option>
                  <option value="DELINQUENT_PERFORMERS_ONLY">Delinquent Dancers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Treasurer Digest Email
                </label>
                <input
                  type="email"
                  value={formSettings.TREASURER_EMAIL}
                  onChange={e => setFormSettings({ ...formSettings, TREASURER_EMAIL: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl"
                  placeholder="treasurer@tradicion.org"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings & Recalculate Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
