import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  Mail, 
  CheckCircle2, 
  Table, 
  LayoutGrid, 
  Receipt, 
  UserCheck, 
  Send, 
  Database, 
  Zap, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Plus,
  Settings,
  Code,
  Globe,
  HelpCircle,
  Filter,
  Clock,
  DollarSign,
  Check,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Link,
  Calendar,
  ChevronDown,
  Moon,
  Sun,
  Sliders,
  BarChart3,
  PieChart,
  Bell,
  FileText,
  AlertTriangle,
  RefreshCw,
  Printer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('header-nav');

  if (!isOpen) return null;

  const isEs = language === 'es';

  const toggleLanguage = () => {
    setLanguage(isEs ? 'en' : 'es');
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { 
      id: 'header-nav', 
      title: isEs ? '1. Menú Superior y Pestañas' : '1. Header & Navigation Bar', 
      desc: isEs ? 'Logotipo, versión 7.0.0, estado de sincronización, correo semanal, selector de idioma y tema' : 'Logo badge, v7.0.0, live sync status, email schedule, language & theme toggles',
      icon: LayoutGrid 
    },
    { 
      id: 'more-actions', 
      title: isEs ? '2. Menú "Más Acciones"' : '2. "More Actions" Dropdown & Popups', 
      desc: isEs ? 'Acciones de ingesta, datos reales, Gmail sync, herramientas de cobro y widgets analíticos' : 'Data intake, Gmail sync, CSV tools, debt collection, and analytical widgets',
      icon: Sliders 
    },
    { 
      id: 'ledger-toolbar', 
      title: isEs ? '3. Barra de Control y Filtros' : '3. Master Ledger Toolbar & Filters', 
      desc: isEs ? 'Desplegable de email/integrante, buscador en tiempo real, pestañas de estado y exportar CSV' : 'Email/performer dropdown, search bar, status pills, and CSV export',
      icon: Filter 
    },
    { 
      id: 'roster-table', 
      title: isEs ? '4. Resumen de Cuotas del Elenco' : '4. Performer Roster Dues Status', 
      desc: isEs ? 'Contadores de mora, badges de saldo ($420.00 adeudado), progreso de pago y columnas' : 'Aging badges, total owed ($420.00), progress bars, and column definitions',
      icon: Table 
    },
    { 
      id: 'edit-performer-modal', 
      title: isEs ? '5. Editar Información del Integrante' : '5. Edit Performer Modal Dialog', 
      desc: isEs ? 'Modificar nombre, correo electrónico, teléfono/notas, guardar cambios o eliminar perfil' : 'Update full name, email address, phone notes, or delete performer record',
      icon: Edit2 
    },
    { 
      id: 'master-ledger', 
      title: isEs ? '6. Libro Mayor Contable 2026' : '6. 2026 Master Accounting Ledger', 
      desc: isEs ? 'Matriz mensual completa (Ene-Dic), cuotas de $15/mes y recargos semanales por mora' : 'Full 2026 monthly breakdown, $15/mo base dues, and weekly late penalties',
      icon: FileSpreadsheet 
    },
    { 
      id: 'performer-drilldown', 
      title: isEs ? '7. Modal de Inspección por Integrante' : '7. Performer Drill-Down Audit Modal', 
      desc: isEs ? 'Auditoría detallada (icono del ojo): pagos 2026, mora acumulada y desglose mensual' : 'Eye icon audit modal: total paid, late fee breakdown, and monthly schedule',
      icon: Eye 
    },
    { 
      id: 'payment-records', 
      title: isEs ? '8. Historial de Pagos e Ingesta' : '8. Payment Records Transaction Log', 
      desc: isEs ? 'Badges de reconciliación (Matched/Pending/Flagged), Gmail Sync, canales y botones de acción' : 'Reconciliation status, Gmail parser, payment channels, and row actions',
      icon: Receipt 
    },
    { 
      id: 'edit-payment-modal', 
      title: isEs ? '9. Modal Corregir/Editar Registro de Pago' : '9. Edit / Correct Payment Modal', 
      desc: isEs ? 'Ajustar pagador, correo asignado, monto USD, canal, asignación de deuda y estado de coincidencia' : 'Adjust payer name, assigned email, amount, fee target, channel, and match status',
      icon: CheckCircle2 
    },
    { 
      id: 'performer-detail-view', 
      title: isEs ? '10. Vista Detallada por Integrante' : '10. Performer Profile & History View', 
      desc: isEs ? 'Directorio lateral, KPIs clave (100% avance), matriz de meses y recibos vinculados' : 'Side directory, KPI summary cards, monthly ledger, and linked receipts log',
      icon: UserCheck 
    },
    { 
      id: 'system-settings', 
      title: isEs ? '11. Configuración y Reglas del Sistema' : '11. System Configuration & Rules', 
      desc: isEs ? 'Cuota base ($15), recargo por mora ($5/sem), tope mensual ($30), ejecutor nocturno y envío semanal' : 'Base dues ($15), late fee ($5/wk), max cap ($30), nightly trigger, and weekly dispatch',
      icon: Settings 
    },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`guide-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between border-b border-slate-800 gap-4 shrink-0 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-900/50 shrink-0 border border-indigo-400/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase text-white">
                  {isEs ? 'Guía Ilustrada del Usuario' : 'Illustrated User Manual'}
                </h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  v7.0.0 Illustrated
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {isEs ? 'Manual completo paso a paso con imágenes detalladas de cada vista, botón y modal' : 'Step-by-step visual documentation with full visual mockups for every screen and control'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Print User Guide Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 hover:border-indigo-300 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md no-print"
              title={isEs ? 'Imprimir Guía o Guardar en PDF' : 'Print User Manual or Save to PDF'}
            >
              <Printer className="w-4 h-4 text-white" />
              <span className="text-xs font-black">{isEs ? '🖨️ Imprimir / PDF' : '🖨️ Print / PDF'}</span>
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-200 hover:text-white border border-indigo-500/40 hover:border-indigo-400 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm no-print"
              title={isEs ? 'Cambiar a Inglés' : 'Switch to Spanish'}
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black">{isEs ? '🇲🇽 ES → 🇺🇸 EN' : '🇺🇸 EN → 🇲🇽 ES'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700 no-print"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 bg-slate-50/60">
          
          {/* Index Table / Table of Contents */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-indigo-950 tracking-wider">
                    {isEs ? 'Índice Interactivo del Manual' : 'Interactive Manual Table of Contents'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEs ? 'Selecciona cualquier módulo para ver su explicación y diagrama ilustrado' : 'Select any section to jump directly to its explanation and visual diagram'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-extrabold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100">
                11 {isEs ? 'Módulos Ilustrados' : 'Illustrated Modules'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 border-indigo-400 text-indigo-950 shadow-xs ring-2 ring-indigo-200/60'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-indigo-950 truncate">{sec.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                        {sec.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: Header & Navigation */}
          <div id="guide-sec-header-nav" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">1</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '1. Menú Superior, Pestañas y Estado del Sistema' : '1. Top Header, Navigation Tabs & System Status'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Estructura general, controles de salud, automatizaciones e idioma' : 'Overall interface architecture, automation health badges, and language controls'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — SYSTEM HEADER BAR</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Top Control Layer</span>
              </div>
              
              {/* Simulated Header Bar */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Brand */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-600 text-white font-black rounded-lg flex items-center justify-center text-xs">T</div>
                  <div>
                    <span className="font-extrabold text-white block text-xs">Tradición Dance Ensemble</span>
                    <span className="text-[9px] text-indigo-400 font-mono">Automated Dues Financial System 7.0.0</span>
                  </div>
                </div>

                {/* Right badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-1 bg-slate-800 text-indigo-300 rounded-lg border border-slate-700 flex items-center gap-1">
                    ✉️ Weekly Email: Mon @ 09:00
                  </span>
                  <span className="px-2 py-1 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/80 font-bold flex items-center gap-1">
                    🟢 SYSTEM OPTIMAL
                  </span>
                  <span className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg flex items-center gap-1">
                    ⚡ Daily Sync
                  </span>
                  <span className="px-2 py-1 bg-indigo-900 text-indigo-200 rounded-lg font-bold">
                    us EN | MX ES
                  </span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">
                    🌙
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-1">
                    🗄️ More Actions ∨
                  </span>
                </div>
              </div>

              {/* Simulated Nav Tabs */}
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg flex items-center gap-1.5 shadow-xs">
                  📌 Dashboard
                </span>
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">
                  📊 Master Ledger
                </span>
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">
                  💳 Payment Records
                </span>
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">
                  👤 By Performer
                </span>
                <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">
                  ⚙️ Settings
                </span>
              </div>
            </div>

            {/* Explanation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-extrabold text-indigo-950 block text-xs">1. Identidad y Versión</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isEs 
                    ? 'Identifica la aplicación oficial de Tradición Dance Ensemble y muestra la versión 7.0.0 del motor contable que gestiona cobros multicanal, recargos automáticos por mora y estados de cuenta.'
                    : 'Identifies the official Tradición Dance Ensemble app and displays current release v7.0.0 powering multi-channel dues tracking, automated late penalties, and accounting ledgers.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-extrabold text-indigo-950 block text-xs">2. Controles de Automatización</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isEs 
                    ? '• ✉️ Weekly Email: Recordatorios automáticos programados para todos los lunes a las 09:00 AM.\n• 🟢 SYSTEM OPTIMAL: Badge de salud en tiempo real de Google Apps Script y base de datos.\n• ⚡ Daily Sync: Disparador manual de sincronización instantánea con Venmo, Zelle y Cash App.'
                    : '• ✉️ Weekly Email: Scheduled automated notification digest sent every Monday at 9:00 AM.\n• 🟢 SYSTEM OPTIMAL: Real-time status indicator for Google Apps Script and database synchronization.\n• ⚡ Daily Sync: On-demand sync trigger across Venmo, Zelle, Cash App, and manual records.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-extrabold text-indigo-950 block text-xs">3. Barra de Navegación Principal</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isEs 
                    ? 'Permite conmutar al instante entre el Panel de Control, el Libro Mayor completo (Master Ledger), los Registros de Pago (Payment Records), la vista por bailarín (By Performer) y la Configuración de reglas (Settings).'
                    : 'Switch seamlessly between the Bento Dashboard, 65-column Master Ledger, Payment Records transaction log, By Performer detailed profiles, and Financial Policy Settings.'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: More Actions Dropdown */}
          <div id="guide-sec-more-actions" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">2</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '2. Menú Desplegable "Más Acciones"' : '2. "More Actions" Executive Control Panel'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Panel unificado dividido en Ingesta de Datos y Widgets Analíticos' : 'Unified control drop panel split into Data Intake and Analytics Popups'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — MORE ACTIONS DROPDOWN MENU</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">🗄️ Executive Panel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Left Column: Data & Intake */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-extrabold text-indigo-400 block border-b border-slate-800 pb-1">
                    📥 1. DATA & INTAKE ACTIONS
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>+ Record Payment Intake</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Quick Form</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>Load Real Data</span>
                      <span className="text-[9px] text-indigo-300 font-mono">GAS Direct Sync</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>Clear Data</span>
                      <span className="text-[9px] text-rose-400 font-mono">Reset Prompt</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>Roster & CSV</span>
                      <span className="text-[9px] text-indigo-300 font-mono">Import/Export</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>Sync Gmail Payments</span>
                      <span className="text-[9px] text-amber-300 font-mono">Regex Intake</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>Debt Collection & Fees</span>
                      <span className="text-[9px] text-rose-300 font-mono">Notice Generator</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center justify-between">
                      <span>Code.gs Diagnostics</span>
                      <span className="text-[9px] text-amber-400 font-mono">Benchmark Logs</span>
                    </div>
                    <div className="p-1.5 bg-indigo-900/80 rounded font-extrabold text-white flex items-center justify-between border border-indigo-500/40">
                      <span>📖 Illustrated User Guide</span>
                      <span className="text-[9px] text-indigo-200 font-mono">Manual v7.0.0</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Widgets & Analytics */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-extrabold text-indigo-400 block border-b border-slate-800 pb-1">
                    📊 2. WIDGETS & ANALYTICS POPUPS
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="p-1.5 bg-slate-900 rounded font-medium flex items-center justify-between">
                      <span>Financial Ruleset</span>
                      <span className="text-[9px] text-slate-400 font-mono">$15/mo, $5/wk</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded font-medium flex items-center justify-between">
                      <span>Executive Dues Summary</span>
                      <span className="text-[9px] text-emerald-400 font-mono">YTD Revenue</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded font-medium flex items-center justify-between">
                      <span>30-Day Payment Volume Trend</span>
                      <span className="text-[9px] text-indigo-300 font-mono">Visual Chart</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded font-medium flex items-center justify-between">
                      <span>Payment Channel Breakdown</span>
                      <span className="text-[9px] text-amber-300 font-mono">Pie Chart</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded font-medium flex items-center justify-between">
                      <span>Modular Architecture</span>
                      <span className="text-[9px] text-indigo-300 font-mono">In-Memory Engine</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded font-medium flex items-center justify-between">
                      <span>Performance Benchmark</span>
                      <span className="text-[9px] text-emerald-300 font-mono">&lt; 2,000ms Latency</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Master Ledger Toolbar */}
          <div id="guide-sec-ledger-toolbar" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">3</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '3. Barra de Control y Herramientas del Libro Mayor' : '3. Master Dues Ledger Control Toolbar'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Buscador instantáneo, selector por correo, filtros por estado y exportación a CSV' : 'Searchable email dropdown, instant search bar, status toggle pills, and CSV export'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — TOOLBAR CONTROLS</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Toolbar Layer</span>
              </div>

              {/* Toolbar Simulation */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-slate-900 text-xs">
                {/* Email Dropdown */}
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold rounded-xl flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>✉️ All Performers / Emails</span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                </div>

                {/* Instant Search */}
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-400 flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 font-medium">Search performer, status, amou...</span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]">All (16)</span>
                  <span className="px-2.5 py-1 text-slate-600 font-bold hover:text-emerald-700 flex items-center gap-1 text-[11px]">🟢 Current</span>
                  <span className="px-2.5 py-1 text-slate-600 font-bold hover:text-amber-700 flex items-center gap-1 text-[11px]">🟡 Overdue</span>
                </div>

                {/* CSV Export */}
                <div className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
                  <span>Export Ledger CSV</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">1. Selector de Email/Bailarín</span>
                <p className="text-[11px] text-slate-600">Filtra toda la matriz contable para aislar el historial de un único bailarín o mostrar todo el grupo.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">2. Búsqueda Instantánea</span>
                <p className="text-[11px] text-slate-600">Busca en tiempo real por nombre, correo electrónico, estado ("Current", "Overdue") o monto en dólares.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">3. Filtros por Estado</span>
                <p className="text-[11px] text-slate-600">Alterna rápidamente entre Todos (16), Al día (🟢 Current) y Morosos (🟡 Overdue).</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">4. Exportar CSV</span>
                <p className="text-[11px] text-slate-600">Descarga la matriz contable activa formateada en hoja de cálculo CSV con nombres, pagos y saldos.</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Performer Roster Dues Status Section & Table */}
          <div id="guide-sec-roster-table" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">4</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '4. Estado de Cuotas del Elenco y Tabla de Integrantes' : '4. Performer Roster Dues Status & Compliance Table'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Resumen de envejecimiento de mora, total adeudado ($420.00) y explicaciones de columnas' : 'Aging badges, debt totals ($420.00 owed), payment progress, and full column definitions'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — ROSTER DUES STATUS & TABLE COLUMNS</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Dashboard Summary</span>
              </div>

              {/* Roster Dues Header Badges */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-extrabold text-white text-xs block">Performer Roster Dues Status</span>
                  <span className="text-[10px] text-slate-400">Real-time compliance, balances & dues tracking across active roster (16 active performers)</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center gap-1">🟢 13 Current</span>
                  <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full flex items-center gap-1">🟡 0 1-30 Days</span>
                  <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full flex items-center gap-1">🔴 3 30+ Days</span>
                  <span className="px-3 py-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-full font-mono text-xs">Owed: $420.00</span>
                </div>
              </div>

              {/* Simulated Table Row */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs overflow-x-auto">
                <div className="min-w-[650px] space-y-2">
                  <div className="grid grid-cols-7 gap-2 font-mono text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 pb-1">
                    <span>PERFORMER NAME & EMAIL</span>
                    <span>DUES PAID PROGRESS</span>
                    <span>TOTAL PAID 2026</span>
                    <span>LATE FEES ACCRUED</span>
                    <span>OWED BALANCE</span>
                    <span>STATUS</span>
                    <span className="text-right">ACTIONS</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 items-center py-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-[10px]">K</div>
                      <div>
                        <span className="font-extrabold block text-[11px]">Kristenc687</span>
                        <span className="text-[9px] text-slate-400 font-mono block">kristenc687@gmail.com</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-[10px] text-slate-600">0% ($0 / $135)</span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5"><div className="w-0 h-full bg-indigo-600"></div></div>
                    </div>
                    <span className="font-bold text-emerald-600">$0.00</span>
                    <span className="font-bold text-amber-600">$110.00</span>
                    <span className="font-extrabold text-rose-600">$170.00</span>
                    <div><span className="px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-full text-[10px]">🔴 30+ Days Overdue</span></div>
                    <div className="text-right"><button className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-lg text-[10px]">✏️ Edit</button></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Explanations */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-indigo-950 tracking-wider block">
                📋 {isEs ? 'Explicación Detallada de Columnas y Funcionalidades' : 'Detailed Column & Function Breakdown'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-950 block">1. Chevron ( &gt; )</span>
                  <p className="text-[11px] text-slate-600">Despliega un panel con el desglose mensual individual de cuotas canceladas y fechas de pago.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-950 block">2. Integrante y Email</span>
                  <p className="text-[11px] text-slate-600">Avatar inicial, nombre completo registrado y correo electrónico para notificaciones.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-950 block">3. Dues Paid Progress</span>
                  <p className="text-[11px] text-slate-600">Barra de progreso visual con el porcentaje completado y fracción pagada vs objetivo anual ($105 / $135).</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-950 block">4. Total Paid 2026</span>
                  <p className="text-[11px] text-slate-600">Suma total de dinero verificado y cobrado a este bailarín en la temporada 2026 (en verde).</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-950 block">5. Late Fees Accrued</span>
                  <p className="text-[11px] text-slate-600">Total acumulado de penalizaciones por mora calculadas según las reglas del sistema (en naranja/naranja-amarillo).</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-950 block">6. Owed Balance &amp; Status</span>
                  <p className="text-[11px] text-slate-600">Saldo neto pendiente (cuotas + mora) en rojo y badge de cumplimiento (🟢 Current, 🔴 30+ Days Overdue).</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Edit Performer Modal Dialog */}
          <div id="guide-sec-edit-performer-modal" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">5</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '5. Modal "Editar Información del Integrante"' : '5. "Edit Performer Information" Modal Dialog'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Ventana emergente para actualizar datos de contacto o eliminar un bailarín del elenco' : 'Modal dialog to edit performer profile details or delete member records'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — EDIT PERFORMER MODAL</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Profile Editor</span>
              </div>

              {/* Modal Dialog Simulation */}
              <div className="max-w-md mx-auto p-5 bg-white rounded-2xl border border-slate-200 shadow-xl text-slate-900 text-xs space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">👤</div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Edit Performer Information</h4>
                      <p className="text-[10px] text-slate-500">Update or correct name, email, or contact number.</p>
                    </div>
                  </div>
                  <X className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">👤 PERFORMER FULL NAME</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">Kristenc687</div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">✉️ EMAIL ADDRESS</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900">kristenc687@gmail.com</div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">📞 PHONE / CONTACT NOTES</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">e.g. 804-555-0199</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1">
                    🗑️ Delete
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                    <button className="px-4 py-1.5 bg-indigo-600 text-white font-extrabold rounded-xl text-xs shadow-sm">💾 Save Changes</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-rose-600 block">1. Botón "Delete" (Rojo)</span>
                <p className="text-[11px] text-slate-600">Elimina de forma permanente el perfil del bailarín de la lista activa del elenco.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">2. Botón "Cancel" (Gris)</span>
                <p className="text-[11px] text-slate-600">Cierra la ventana modal descartando cualquier cambio no guardado.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-600 block">3. Botón "Save Changes" (Morado)</span>
                <p className="text-[11px] text-slate-600">Guarda los nuevos datos (Nombre, Email o Teléfono) e impacta inmediatamente en todas las tablas contables.</p>
              </div>
            </div>
          </div>

          {/* SECTION 6: 2026 Master Dues Accounting Ledger */}
          <div id="guide-sec-master-ledger" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">6</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '6. Libro Mayor Contable de Cuotas 2026' : '6. 2026 Master Dues Accounting Ledger Grid'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Matriz contable mensual completa con acumulados, exenciones y recargos' : 'Full monthly matrix with accumulated totals, exemptions, and weekly penalties'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — 2026 MASTER ACCOUNTING LEDGER</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Master Grid</span>
              </div>

              {/* Table Simulation */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs overflow-x-auto">
                <div className="min-w-[800px] space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-black text-xs block text-slate-900 uppercase">2026 MASTER DUES ACCOUNTING LEDGER</span>
                      <span className="text-[10px] text-slate-500 font-mono">Live monthly breakdown with carryover balances and weekly late penalties</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-[10px] border border-indigo-100">Showing 16 Records</span>
                  </div>

                  <div className="grid grid-cols-8 gap-2 font-mono text-[9px] text-slate-400 uppercase font-bold bg-slate-900 text-white p-2 rounded-lg">
                    <span>PERFORMER NAME</span>
                    <span>EMAIL</span>
                    <span>STATUS</span>
                    <span>TOTAL PAID</span>
                    <span>TOTAL LATE</span>
                    <span>OWES YEAR</span>
                    <span>JAN 2026 (EXEMPT)</span>
                    <span>FEB 2026 (EXEMPT)</span>
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center p-2 border-b border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                      <span>Adevalle12</span>
                      <button className="text-slate-400 hover:text-indigo-600">✏️</button>
                      <button className="text-slate-400 hover:text-indigo-600">👁️</button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono truncate">adevalle12@gmail.com</span>
                    <div><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px]">🟢 Current</span></div>
                    <span className="font-bold text-emerald-600">$105.00</span>
                    <span className="text-slate-400">-</span>
                    <span className="font-bold text-slate-900">$0.00</span>
                    <div className="text-[10px] text-slate-500 font-mono">Paid: $0 | Bal: $0</div>
                    <div className="text-[10px] text-slate-500 font-mono">Paid: $0 | Bal: $0</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">✏️ Icono de Lápiz</span>
                <p className="text-[11px] text-slate-600">Abre el modal para modificar el nombre, correo electrónico o teléfono del integrante.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">👁️ Icono de Ojo</span>
                <p className="text-[11px] text-slate-600">Abre el modal de inspección detallada auditoría (Performer Drill-Down) para ver todos sus cobros y pagos.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">Columnas Mensuales (Ene–Dic)</span>
                <p className="text-[11px] text-slate-600">Muestra los pagos ingresados (Paid: $X), saldos restantes (Bal: $X) e indica (EXEMPT) en meses exentos de cuota.</p>
              </div>
            </div>
          </div>

          {/* SECTION 7: Performer Drill-Down Audit Modal */}
          <div id="guide-sec-performer-drilldown" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">7</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '7. Modal de Auditoría e Inspección (Performer Drill-Down)' : '7. Performer Drill-Down Audit Modal (Eye Icon)'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Vista de inspección individual activada desde el icono de ojo (👁️)' : 'Individual audit window activated by clicking the eye icon (👁️) on any ledger row'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — PERFORMER DRILL-DOWN MODAL</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Audit Inspection</span>
              </div>

              {/* Drill-Down Simulation */}
              <div className="max-w-lg mx-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-xl text-slate-900 text-xs space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 block">PERFORMER DRILL-DOWN</span>
                    <h4 className="font-black text-sm text-slate-900">Adevalle12</h4>
                    <span className="text-[10px] text-slate-500 font-mono">adevalle12@gmail.com • No phone listed</span>
                  </div>
                  <X className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[9px] text-emerald-700 block uppercase font-bold">TOTAL PAID 2026</span>
                    <span className="text-sm font-black text-emerald-900">$105.00</span>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[9px] text-amber-700 block uppercase font-bold">TOTAL LATE FEES</span>
                    <span className="text-sm font-black text-amber-900">$0.00</span>
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-[9px] text-rose-700 block uppercase font-bold">OWES YEAR</span>
                    <span className="text-sm font-black text-rose-900">$0.00</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                  <span className="font-extrabold uppercase text-[10px] text-slate-500 block">MONTHLY DUES BREAKDOWN (APRIL – DECEMBER 2026)</span>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold block">April 2026</span>
                      <span className="text-[9px] text-slate-400">Due Deadline: 1st Mon (4/6/2026)</span>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span>Base: $15 | Paid: <strong className="text-emerald-600">$15</strong> | Late: $0 | Bal: <strong className="text-slate-900">$0</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: Payment Records Hub */}
          <div id="guide-sec-payment-records" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">8</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '8. Hub de Registros de Pago y Motor de Ingesta' : '8. Payment Records Transaction Log & Intake Engine'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Registro completo de transacciones, extracción por Gmail, canales y estados' : 'Complete transactional audit log, Gmail parser, payment channel tags, and row actions'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — INTAKE ENGINE TRANSACTION LOG</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Intake Log</span>
              </div>

              {/* Status Badges Header */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 bg-slate-950 text-white rounded-xl border border-slate-700">All Payments (123)</span>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">🟢 Matched (Linked) (0)</span>
                <span className="px-3 py-1 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">⚠️ Pending (Review) (0)</span>
                <span className="px-3 py-1 bg-rose-950 text-rose-400 rounded-xl border border-rose-800">🚫 Flagged (Unresolved) (0)</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Search by payer, ref, status...</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs border border-rose-200">✉️ Sync Gmail</span>
                  <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-xl text-xs">+ Record Intake</span>
                </div>
              </div>

              {/* Simulated Table */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs overflow-x-auto">
                <div className="min-w-[700px] space-y-2">
                  <div className="grid grid-cols-8 gap-2 font-mono text-[9px] text-slate-400 uppercase font-bold border-b border-slate-100 pb-1">
                    <span>REF #</span>
                    <span>EMAIL</span>
                    <span>PAYER NAME</span>
                    <span>SUBJECT / HEADER</span>
                    <span>DATE</span>
                    <span>AMOUNT</span>
                    <span>CHANNEL</span>
                    <span className="text-right">ACTIONS</span>
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center py-1 border-b border-slate-100 text-[11px]">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">REF-GAS-525050</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate">csantiago1958@gmail.com</span>
                    <span className="font-bold text-slate-900">Carmen Santiago</span>
                    <span className="text-slate-600 truncate">Payment received</span>
                    <span className="font-mono text-[10px]">2026-09-01</span>
                    <span className="font-extrabold text-emerald-600">$15.00</span>
                    <div><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[9px]">🟢 Cash App</span></div>
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1 bg-indigo-50 text-indigo-700 rounded">✏️</button>
                      <button className="p-1 bg-indigo-50 text-indigo-700 rounded">🔗 Link</button>
                      <button className="p-1 bg-rose-50 text-rose-600 rounded">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9: Edit / Correct Payment Record Modal */}
          <div id="guide-sec-edit-payment-modal" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">9</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '9. Modal "Editar / Corregir Registro de Pago"' : '9. "Edit / Correct Payment Record" Modal'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Ajustes de monto, asignación de correo, canal de pago, fecha y tipo de deuda' : 'Re-assign email, adjust amount, select fee target, date, and reconciliation match status'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — EDIT PAYMENT DIALOG</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Payment Editor</span>
              </div>

              {/* Payment Modal Simulation */}
              <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-xl text-slate-900 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Edit / Correct Payment Record</h4>
                    <p className="text-[10px] text-slate-500">Adjust amount, assigned email, payment channel, or date.</p>
                  </div>
                  <X className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-left text-[11px]">
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block mb-0.5">👤 PAYER NAME</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold">Carmen Santiago</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block mb-0.5">✉️ ASSIGNED EMAIL</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] truncate">csantiago1958@gmail.com</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block mb-0.5">💲 AMOUNT ($ USD)</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-extrabold text-emerald-600">15</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block mb-0.5">🏷️ PAYMENT CHANNEL</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold">🟣 Venmo</div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block mb-0.5">🎯 FEE ALLOCATION TARGET</label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-indigo-950">
                    🔵 Total Deuda (Base Dues + Late Fees)
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs">🗑️ Delete</button>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                    <button className="px-4 py-1.5 bg-indigo-600 text-white font-extrabold rounded-xl text-xs">💾 Save Changes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 10: Individual Performer Detail & Ledger View */}
          <div id="guide-sec-performer-detail-view" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">10</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '10. Vista Detallada por Integrante (By Performer Tab)' : '10. Individual Performer Profile & History View'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Directorio lateral, tarjetas de resumen KPI (100% avance), matriz mensual y recibos' : 'Side directory list, key metric KPI cards, monthly ledger, and linked transaction history'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — INDIVIDUAL PERFORMER PROFILE VIEW</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Performer View</span>
              </div>

              {/* Performer View Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-900 text-xs">
                {/* Left Sidebar */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="font-extrabold text-[11px] block uppercase border-b border-slate-100 pb-1">PERFORMER DIRECTORY</span>
                  <div className="space-y-1">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-between text-[11px]">
                      <span>Adevalle12</span>
                      <span className="text-[9px] bg-indigo-800 px-1.5 py-0.5 rounded">$105 PAID</span>
                    </div>
                    <div className="p-2 bg-slate-50 text-slate-700 rounded-xl font-medium flex items-center justify-between text-[11px]">
                      <span>Huneco27</span>
                      <span className="text-[9px] text-slate-400">$105 PAID</span>
                    </div>
                  </div>
                </div>

                {/* Right Profile & Metrics */}
                <div className="md:col-span-2 space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center">A</div>
                      <div>
                        <h4 className="font-black text-xs">Adevalle12 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[9px]">🟢 Current</span></h4>
                        <span className="text-[10px] text-slate-500 font-mono">adevalle12@gmail.com</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="px-2.5 py-1 bg-slate-100 font-bold rounded-lg text-[10px]">✏️ Edit Profile</button>
                      <button className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px]">+ Record Payment</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-emerald-700 block font-bold">TOTAL PAID 2026</span>
                      <span className="text-xs font-black text-emerald-900">$105.00</span>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-amber-700 block font-bold">LATE FEES</span>
                      <span className="text-xs font-black text-amber-900">$0.00</span>
                    </div>
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-rose-700 block font-bold">OWED</span>
                      <span className="text-xs font-black text-rose-900">$0.00</span>
                    </div>
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <span className="text-indigo-700 block font-bold">SEASON PROGRESS</span>
                      <span className="text-xs font-black text-indigo-900">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 11: System Configuration & Rule Settings */}
          <div id="guide-sec-system-settings" className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-indigo-950 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">11</div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  {isEs ? '11. Configuración de Reglas del Sistema y Parámetros' : '11. System Configuration & Financial Policy Rules'}
                </h3>
                <p className="text-xs text-slate-500">{isEs ? 'Panel administrativo global para modificar cuotas ($15/mes), recargos, ejecutor nocturno y envíos semanales' : 'Global admin parameters governing monthly base dues ($15), late fee penalties ($5/wk), max caps ($30), and email dispatch'}</p>
              </div>
            </div>

            {/* VISUAL MOCKUP PIC */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>📸 VISUAL MOCKUP — SYSTEM CONFIGURATION PANEL</span>
                <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full text-[9px]">Settings Layer</span>
              </div>

              {/* Settings Simulation */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-900 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-xs uppercase">System Configuration &amp; Rule Settings</span>
                  <button className="px-2.5 py-1 bg-slate-100 font-bold rounded-lg text-[10px]">🔄 Reset Defaults</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">💲 BASE MONTHLY DUES</span>
                    <span className="text-xs font-black text-slate-900">$15</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">📅 DUES START MONTH</span>
                    <span className="text-xs font-black text-slate-900">April 2026</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">⚠️ LATE FEE PENALTY</span>
                    <span className="text-xs font-black text-slate-900">$5 / week</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">🛑 MAX MONTHLY CAP</span>
                    <span className="text-xs font-black text-slate-900">$30 max</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-[11px]">✉️ AUTOMATED WEEKLY EMAIL DISPATCH ENGINE</span>
                    <span className="w-8 h-4 bg-indigo-600 rounded-full inline-block"></span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div><span className="text-slate-500 block">SCHEDULE:</span><strong className="text-slate-900">Mon @ 09:00 AM</strong></div>
                    <div><span className="text-slate-500 block">SCOPE:</span><strong className="text-slate-900">Dancers + Treasurer Digest</strong></div>
                    <div><span className="text-slate-500 block">TREASURER:</span><strong className="text-slate-900">treasurer@tradicion.org</strong></div>
                  </div>
                </div>

                <div className="text-right pt-2 border-t border-slate-100">
                  <button className="px-4 py-2 bg-indigo-600 text-white font-extrabold rounded-xl text-xs shadow-sm">
                    💾 Save Settings &amp; Recalculate Ledger
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-bold">
              Tradición Dance Ensemble • Dues Accounting System v7.0.0 Illustrated Guide
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            {isEs ? 'Entendido / Cerrar Guía' : 'Got it / Close Manual'}
          </button>
        </div>

      </div>
    </div>
  );
};
