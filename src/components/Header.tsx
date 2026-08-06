import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutGrid, 
  Table, 
  Receipt, 
  Settings, 
  Code2, 
  Clock, 
  CheckCircle2, 
  Zap,
  Plus,
  Mail,
  Database,
  CloudDownload,
  Trash2,
  ChevronDown,
  Layers,
  Scale,
  Users,
  BookOpen,
  Sun,
  Moon,
  ShieldX,
  AlertTriangle,
  X,
  Sliders,
  Building2,
  TrendingUp,
  PieChart,
  Cpu,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { WidgetType } from '../types';


interface HeaderProps {
  activeTab: 'dashboard' | 'ledger' | 'payments' | 'performers' | 'settings' | 'diagnostics';
  setActiveTab: (tab: 'dashboard' | 'ledger' | 'payments' | 'performers' | 'settings' | 'diagnostics') => void;
  executionTimeMs: number;
  onOpenAddPayment: () => void;
  onTriggerDailySync: () => void;
  isSyncing: boolean;
  onOpenWeeklyEmailPreview?: () => void;
  onOpenDataManagement?: () => void;
  onOpenGmailSync?: () => void;
  onOpenLoadRealData?: () => void;
  onClearAllData?: () => void;
  onResetBaselineData?: () => void;
  onOpenDebtCollection?: () => void;
  onOpenUserGuide?: () => void;
  onOpenExcludedPerformers?: () => void;
  onOpenWidgetModal?: (widget: WidgetType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  executionTimeMs,
  onOpenAddPayment,
  onTriggerDailySync,
  isSyncing,
  onOpenWeeklyEmailPreview,
  onOpenDataManagement,
  onOpenGmailSync,
  onOpenLoadRealData,
  onClearAllData,
  onResetBaselineData,
  onOpenDebtCollection,
  onOpenUserGuide,
  onOpenExcludedPerformers,
  onOpenWidgetModal
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isDataDropdownOpen, setIsDataDropdownOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDataDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-2 sm:top-4 z-40 mb-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md transition-all text-slate-800 dark:text-slate-100">
      {/* Top Row: Logo/Title & System Action Badges */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <img 
            src="./logo.jpg" 
            alt="Logo" 
            className="w-11 h-11 rounded-full object-cover shadow-md border-2 border-indigo-500 shrink-0" 
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {language === 'es' ? 'Cuotas Mensuales' : 'Monthly Dues'}
            </h1>
            <p className="text-xs font-normal text-slate-400 dark:text-slate-500 mt-0.5">
              System 7.0.0
            </p>
          </div>
        </div>

        {/* Right Column Container: Badges on Top, Divider Line, Navigation Tabs */}
        <div className="flex flex-col items-start shrink-0 max-w-full">
          {/* System Health & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Weekly Email Badge */}
          {onOpenWeeklyEmailPreview && (
            <button
              onClick={onOpenWeeklyEmailPreview}
              className="h-9 px-3.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-[#f4f6ff] dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 rounded-xl transition-all border border-indigo-200/90 dark:border-indigo-800 flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
              title="Preview automated weekly email dispatch"
            >
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap">Weekly Email:: <strong className="font-bold">Mon @ 09:00</strong></span>
            </button>
          )}

          {/* System Optimal Badge */}
          <div className="h-9 px-3.5 flex items-center bg-[#f0fdf4] dark:bg-emerald-950/40 rounded-xl border border-emerald-300/80 dark:border-emerald-800 shrink-0 whitespace-nowrap">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shrink-0"></span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mr-1.5" />
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide whitespace-nowrap">
              SYSTEM OPTIMAL
            </span>
          </div>

          {/* Daily Sync */}
          <button
            onClick={onTriggerDailySync}
            disabled={isSyncing}
            className="h-9 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-[#f4f5fa] dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
            title="Execute dry-run in-memory recalculation"
          >
            <Zap className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">{isSyncing ? t('btnSyncing') : 'Daily Sync'}</span>
          </button>

          {/* Segmented Language Toggle (us EN / MX ES) */}
          <div className="h-9 flex items-center bg-[#edeef4] dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Switch to English"
            >
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">us</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                language === 'es'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Cambiar a Español"
            >
              <span className="text-xs font-normal text-slate-400">MX</span>
              <span>ES</span>
            </button>
          </div>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 bg-[#f4f5fa] dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
            title={isDark ? (language === 'es' ? 'Cambiar a Modo Día' : 'Switch to Day Mode') : (language === 'es' ? 'Cambiar a Modo Noche' : 'Switch to Night Mode')}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
          </button>

          {/* Unified More Actions Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDataDropdownOpen(!isDataDropdownOpen)}
              className="h-9 px-4 text-xs font-bold text-slate-900 dark:text-indigo-100 bg-white dark:bg-slate-900 hover:bg-indigo-50/80 dark:hover:bg-slate-800 rounded-2xl transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap font-bold text-slate-900 dark:text-indigo-100">{language === 'es' ? 'Más Acciones' : 'More Actions'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-indigo-400 transition-transform duration-200 shrink-0 ${isDataDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDataDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsDataDropdownOpen(false);
                    onOpenAddPayment();
                  }}
                  className="w-[calc(100%-16px)] mx-2 my-1.5 text-left px-3 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 flex items-center gap-2.5 transition-all cursor-pointer rounded-xl shadow-sm"
                >
                  <div className="w-7 h-7 bg-white/20 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-xs">{language === 'es' ? 'Registrar Pago (Intake)' : '+ Record Payment Intake'}</span>
                    <span className="text-[10px] text-indigo-100 font-normal block">Log Venmo / Cash / Check intake</span>
                  </div>
                </button>

                {onOpenLoadRealData && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      onOpenLoadRealData();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center shrink-0">
                      <CloudDownload className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Cargar Datos Reales' : 'Load Real Data'}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal block">GAS / Sheet Backend Sync</span>
                    </div>
                  </button>
                )}

                {/* Data Management Section */}
                <div className="px-3 py-1.5 border-b border-t border-slate-100 dark:border-slate-800 my-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    {language === 'es' ? 'Gestión de Datos' : 'Data Management'}
                  </p>
                </div>

                {onClearAllData && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      setIsClearConfirmOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg flex items-center justify-center shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Eliminar Todos los Datos de Prueba' : 'Delete All Test Data'}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-normal block">{language === 'es' ? 'Borrar registros, respuestas y exclusiones' : 'Wipe all records, responses & exclusions'}</span>
                    </div>
                  </button>
                )}

                {onResetBaselineData && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      setIsResetConfirmOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center shrink-0">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Restablecer Datos de Muestra' : 'Reset Sample Baseline Data'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block">{language === 'es' ? 'Restaurar registros iniciales de demostración' : 'Restore initial sample demo records'}</span>
                    </div>
                  </button>
                )}

                {onOpenDataManagement && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      onOpenDataManagement();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center shrink-0">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Elenco y CSV' : 'Roster & CSV'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block">Import/Export & Roster Table</span>
                    </div>
                  </button>
                )}

                {onOpenGmailSync && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      onOpenGmailSync();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Sincronizar Pagos Gmail / Voice' : 'Sync Gmail & Voice Payments'}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-normal block">Extract Venmo, Cash App & SMS</span>
                    </div>
                  </button>
                )}

                {onOpenDebtCollection && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      onOpenDebtCollection();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5 transition-all cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg flex items-center justify-center shrink-0">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Cobro de Deudas y Recargos' : 'Debt Collection & Fees'}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal block">Recover overdue late fees & dues</span>
                    </div>
                  </button>
                )}

                {onOpenExcludedPerformers && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      onOpenExcludedPerformers();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-all cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center shrink-0">
                      <ShieldX className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Integrantes Excluidos' : 'Excluded Performers'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block">EXCLUDED_PERFORMERS system accounts</span>
                    </div>
                  </button>
                )}

                {onOpenUserGuide && (
                  <button
                    onClick={() => {
                      setIsDataDropdownOpen(false);
                      onOpenUserGuide();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-indigo-900 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 transition-all cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-black">{language === 'es' ? 'Guía Ilustrada del Usuario' : '📖 Illustrated User Guide'}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal block">Index & step-by-step instructions</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsDataDropdownOpen(false);
                    if (onOpenWidgetModal) onOpenWidgetModal('performanceBenchmark');
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="block font-black text-[11px]">{language === 'es' ? 'Rendimiento en Vivo' : 'Performance Benchmark'}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-normal block">Execution time & speedup test</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator Line under badges */}
        <div className="w-full h-[1.5px] bg-slate-200 dark:bg-slate-800 my-2"></div>

        {/* Navigation Tabs Row aligned under badges */}
        <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none w-full justify-start pt-0.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-indigo-600 text-white rounded-2xl shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
            }`}
          >
            <Table className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Master Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white rounded-2xl shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
            }`}
          >
            <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Payment Records</span>
          </button>

          <button
            onClick={() => setActiveTab('performers')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'performers'
                ? 'bg-indigo-600 text-white rounded-2xl shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
            }`}
          >
            <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>By Performer</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white rounded-2xl shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>

      {/* Clear Data Warning Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-left">
            <button
              onClick={() => setIsClearConfirmOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'es' ? '⚠️ Confirmar Eliminación de Datos' : '⚠️ Confirm Data Deletion'}
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                  {language === 'es' ? 'Acción permanente e irreversible' : 'Permanent and irreversible action'}
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-xs text-rose-900 dark:text-rose-200 space-y-2">
              <p className="font-semibold leading-relaxed">
                {language === 'es'
                  ? '¿Está seguro de que desea eliminar todos los datos? Esta acción eliminará permanentemente todo el elenco de bailarines registrado y el historial de pagos de las cuotas almacenado en el sistema.'
                  : 'Are you sure you want to clear all data? This action will permanently remove all registered performers from the active roster and purge all stored payment history records.'}
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                {language === 'es'
                  ? 'Para recuperar información posteriormente, deberá volver a sincronizar la base de datos de Google Sheets o realizar una importación CSV.'
                  : 'To restore data later, you will need to re-sync with your Google Sheets backend or perform a CSV import.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setIsClearConfirmOpen(false);
                  if (onClearAllData) onClearAllData();
                }}
                className="px-4 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'es' ? 'Sí, Limpiar Datos' : 'Yes, Clear All Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-left">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'es' ? '🔄 Restablecer Datos de Muestra' : '🔄 Reset Sample Baseline Data'}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  {language === 'es' ? 'Restaurar registros iniciales de demostración' : 'Restore initial sample demo records'}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <p className="font-semibold leading-relaxed">
                {language === 'es'
                  ? '¿Está seguro de que desea restablecer los datos de demostración? Esto reemplazará el elenco y los pagos actuales con los datos iniciales de muestra.'
                  : 'Are you sure you want to restore the sample baseline data? This will replace current roster and payment entries with default demo records.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  if (onResetBaselineData) onResetBaselineData();
                }}
                className="px-4 py-2.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'es' ? 'Sí, Restablecer Datos' : 'Yes, Restore Baseline Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

