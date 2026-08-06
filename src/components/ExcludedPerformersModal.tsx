import React, { useState, useEffect, useMemo } from 'react';
import { ShieldX, X, Plus, Trash2, Check, UserX, Search } from 'lucide-react';
import { SystemSettings, RawPerformer } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ExcludedPerformersModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onSaveSettings: (updated: SystemSettings) => void;
  roster: RawPerformer[];
}

export const ExcludedPerformersModal: React.FC<ExcludedPerformersModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  roster
}) => {
  const { language } = useLanguage();
  const [excludedList, setExcludedList] = useState<string[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [selectedRosterEmail, setSelectedRosterEmail] = useState<string>('');
  const [isRawMode, setIsRawMode] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const current = settings.EXCLUDED_PERFORMERS || [];
      setExcludedList(current);
      setRawText(current.join(', '));
      setSavedSuccess(false);
      setNewEmail('');
      setSelectedRosterEmail('');
    }
  }, [isOpen, settings]);

  const handleRemoveEmail = (emailToRemove: string) => {
    const updated = excludedList.filter(e => e.toLowerCase().trim() !== emailToRemove.toLowerCase().trim());
    setExcludedList(updated);
    setRawText(updated.join(', '));
  };

  const handleAddEmail = (emailToAdd: string) => {
    const trimmed = emailToAdd.trim().toLowerCase();
    if (!trimmed) return;
    if (excludedList.some(e => e.toLowerCase().trim() === trimmed)) return;

    const updated = [...excludedList, trimmed];
    setExcludedList(updated);
    setRawText(updated.join(', '));
    setNewEmail('');
    setSelectedRosterEmail('');
  };

  const handleRawTextChange = (text: string) => {
    setRawText(text);
    const parsed = text
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
    // Unique
    const unique = Array.from(new Set(parsed));
    setExcludedList(unique);
  };

  const handleSave = () => {
    // Clean list
    const cleaned = rawText
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
    const uniqueList = Array.from(new Set(cleaned));

    onSaveSettings({
      ...settings,
      EXCLUDED_PERFORMERS: uniqueList
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  // Available roster emails not currently excluded
  const availableRoster = useMemo(() => {
    return roster.filter(p => !excludedList.some(e => e.toLowerCase() === p.email.toLowerCase()));
  }, [roster, excludedList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 text-rose-300 rounded-2xl flex items-center justify-center border border-rose-400/30">
              <ShieldX className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                EXCLUDED PERFORMERS
                <span className="text-[10px] font-mono font-bold bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/30">
                  EXCLUDED_PERFORMERS
                </span>
              </h2>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {language === 'es'
                  ? 'Lista de cuentas o roles del sistema excluidos del seguimiento de cuotas'
                  : 'Comma-separated list of system accounts/roles excluded from dues tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Main Card (Matches User Screenshot Style) */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-500" />
                  {language === 'es' ? 'Cuentas Excluidas del Sistema' : 'Excluded Performers (EXCLUDED_PERFORMERS)'}
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'es'
                    ? 'Lista separada por comas de roles/cuentas excluidas del cómputo de deudas'
                    : 'Comma-separated list of system accounts/roles excluded from dues tracking'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRawMode(!isRawMode)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isRawMode ? (language === 'es' ? 'Ver modo etiquetas' : 'Switch to Tag Mode') : (language === 'es' ? 'Editar texto plano' : 'Edit Raw Text')}
              </button>
            </div>

            {/* Visual Tags Mode */}
            {!isRawMode && (
              <div className="space-y-3">
                {/* Current Excluded Pills */}
                <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[80px]">
                  {excludedList.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      {language === 'es' ? 'No hay roles excluidos actualmente.' : 'No system roles currently excluded.'}
                    </span>
                  ) : (
                    excludedList.map(email => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs font-mono font-medium shadow-xs"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:bg-rose-200 dark:hover:bg-rose-900/80 rounded-md p-0.5 transition-colors cursor-pointer text-rose-600 dark:text-rose-400"
                          title="Remove email"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Select from Roster */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      {language === 'es' ? 'Excluir integrante del elenco:' : 'Exclude performer from roster:'}
                    </label>
                    <select
                      value={selectedRosterEmail}
                      onChange={e => {
                        const val = e.target.value;
                        if (val) {
                          handleAddEmail(val);
                        }
                      }}
                      className="w-full p-2.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 cursor-pointer"
                    >
                      <option value="">{language === 'es' ? '-- Seleccionar integrante --' : '-- Select Performer --'}</option>
                      {availableRoster.map(p => (
                        <option key={p.email} value={p.email}>
                          {p.name} ({p.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Option B: Type custom email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      {language === 'es' ? 'O agregar correo personalizado:' : 'Or add custom system email:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEmail(newEmail);
                          }
                        }}
                        placeholder="e.g. system.bot@tradicion.org"
                        className="w-full p-2.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddEmail(newEmail)}
                        className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'es' ? 'Agregar' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Textarea Mode (Matching User Image) */}
            {isRawMode && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={e => handleRawTextChange(e.target.value)}
                  className="w-full p-3 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
                  placeholder="admin@tradicion.org, director@tradicion.org, archive@tradicion.org"
                />
                <p className="text-[10px] text-slate-400">
                  {language === 'es'
                    ? 'Escriba direcciones de correo separadas por comas. Las entradas vacías se ignorarán.'
                    : 'Separate emails with commas. Empty entries will be ignored automatically.'}
                </p>
              </div>
            )}
          </div>

          {/* Helper info box */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
            <ShieldX className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 dark:text-indigo-200">
              <p className="font-bold mb-1">
                {language === 'es' ? '¿Cómo afectan las exclusiones al cálculo de cuotas?' : 'How Excluded Performers affect accounting logic:'}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-800 dark:text-indigo-300">
                <li>
                  {language === 'es'
                    ? 'Los integrantes excluidos no acumulan cargos semanales ni cuotas pendientes.'
                    : 'Excluded accounts will not accrue weekly dues or late fees.'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Se clasifican bajo el estado "Excluido" en el Libro Mayor (Ledger).'
                    : 'They are grouped under "Excluded" status in the Master Ledger.'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Se omiten automáticamente en recordatorios de pago de Gmail.'
                    : 'Automatically omitted from automated email payment dispatch.'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-500">
            {excludedList.length} {language === 'es' ? 'cuentas excluidas' : 'excluded accounts'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                savedSuccess ? 'bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{language === 'es' ? '¡Guardado!' : 'Saved!'}</span>
                </>
              ) : (
                <>
                  <ShieldX className="w-4 h-4 text-white" />
                  <span>{language === 'es' ? 'Guardar Cambios' : 'Save Excluded List'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
