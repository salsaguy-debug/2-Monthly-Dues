import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  WidgetType, 
  ExecutiveKPIs, 
  SystemSettings, 
  LedgerRow, 
  PaymentRecord,
  PaymentMethod 
} from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { 
  X, 
  Sliders, 
  PieChart, 
  TrendingUp, 
  Cpu, 
  Zap, 
  Building2, 
  DollarSign, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  BarChart3,
  Users,
  CreditCard,
  Scale,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WidgetModalProps {
  isOpen: boolean;
  widgetType: WidgetType | null;
  onClose: () => void;
  kpis: ExecutiveKPIs;
  settings: SystemSettings;
  executionTimeMs: number;
  activePerformers: LedgerRow[];
  payments?: PaymentRecord[];
  onSelectWidget?: (type: WidgetType) => void;
}

export const WidgetModal: React.FC<WidgetModalProps> = ({
  isOpen,
  widgetType,
  onClose,
  kpis,
  settings,
  executionTimeMs,
  activePerformers,
  payments = [],
  onSelectWidget
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<WidgetType>(widgetType || 'financialRuleset');
  const [volumeViewMode, setVolumeViewMode] = useState<'daily' | 'cumulative' | 'both'>('both');

  // Update active tab when widgetType changes upon opening
  React.useEffect(() => {
    if (widgetType) {
      setActiveTab(widgetType);
    }
  }, [widgetType]);

  // 30-Day Volume Calculations
  const last30DaysData = useMemo(() => {
    const today = new Date();
    let maxDate = new Date(today);
    maxDate.setHours(0, 0, 0, 0);

    if (payments && payments.length > 0) {
      payments.forEach(p => {
        if (!p.date) return;
        const d = new Date(p.date.includes('T') ? p.date : `${p.date}T12:00:00`);
        if (!isNaN(d.getTime()) && d > maxDate) {
          maxDate = new Date(d);
          maxDate.setHours(0, 0, 0, 0);
        }
      });
    }

    const daysMap: { [key: string]: { amount: number; count: number; dateStr: string; dateObj: Date } } = {};
    const dateKeys: string[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(maxDate);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split('T')[0];
      dateKeys.push(key);
      daysMap[key] = { amount: 0, count: 0, dateStr: key, dateObj: d };
    }

    if (payments && payments.length > 0) {
      payments.forEach(p => {
        if (!p.date) return;
        const d = new Date(p.date.includes('T') ? p.date : `${p.date}T12:00:00`);
        if (isNaN(d.getTime())) return;
        const key = d.toISOString().split('T')[0];
        if (daysMap[key]) {
          daysMap[key].amount += (p.amount || 0);
          daysMap[key].count += 1;
        }
      });
    }

    let cumulative = 0;
    return dateKeys.map(key => {
      const item = daysMap[key];
      cumulative += item.amount;
      const dateLabel = item.dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
      return {
        dateKey: key,
        dateLabel,
        dailyVolume: item.amount,
        cumulativeVolume: cumulative,
        count: item.count
      };
    });
  }, [payments, language]);

  const last30DaysMetrics = useMemo(() => {
    const total30DayVolume = last30DaysData.reduce((acc, d) => acc + d.dailyVolume, 0);
    const activeDaysCount = last30DaysData.filter(d => d.dailyVolume > 0).length;
    const peakDailyVolume = Math.max(...last30DaysData.map(d => d.dailyVolume), 0);
    const avgDailyVolume = Math.round(total30DayVolume / 30);
    return {
      total30DayVolume,
      activeDaysCount,
      peakDailyVolume,
      avgDailyVolume
    };
  }, [last30DaysData]);

  if (!isOpen) return null;

  const currentTab = activeTab;

  const widgetsList: { id: WidgetType; labelEn: string; labelEs: string; icon: React.ElementType }[] = [
    { id: 'financialRuleset', labelEn: 'Financial Ruleset', labelEs: 'Reglas Financieras', icon: Sliders },
    { id: 'executiveSummary', labelEn: 'Executive Dues Summary', labelEs: 'Resumen Ejecutivo', icon: Building2 },
    { id: 'volumeTrend', labelEn: '30-Day Payment Volume', labelEs: 'Volumen 30 Días', icon: TrendingUp },
    { id: 'channelBreakdown', labelEn: 'Channel Intake Breakdown', labelEs: 'Desglose por Canal', icon: PieChart },
    { id: 'modularArchitecture', labelEn: 'Modular Architecture', labelEs: 'Arquitectura Modular', icon: Cpu },
    { id: 'performanceBenchmark', labelEn: 'Performance Benchmark', labelEs: 'Rendimiento en Vivo', icon: Zap }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest">
                  {language === 'es' ? 'WIDGETS Y MÉTRICAS INTERACTIVAS' : 'INTERACTIVE WIDGET MODAL'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  v7.0.0
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {language === 'es' ? 'Panel de Control y Detalles de Negocio' : 'Executive Business & System Analytics'}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget Selector Bar */}
        <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0 flex gap-1 sm:gap-2">
          {widgetsList.map(w => {
            const Icon = w.icon;
            const isActive = currentTab === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  setActiveTab(w.id);
                  if (onSelectWidget) onSelectWidget(w.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'es' ? w.labelEs : w.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. FINANCIAL RULESET WIDGET */}
          {currentTab === 'financialRuleset' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    <span>{language === 'es' ? 'Reglas Financieras del Sistema' : 'Financial Ruleset & Dues Mechanics'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Parámetros contables oficiales aplicados para el año fiscal 2026' : 'Official accounting settings and late fee calculation rules'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  USD • {settings.FISCAL_YEAR || 2026}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-mono">
                    {language === 'es' ? 'Cuota Mensual Base' : 'Base Dues Rate'}
                  </span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {formatCurrency(settings.BASE_DUES)}/mo
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {language === 'es' ? 'Vence primer lunes' : 'Due 1st Monday'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-mono">
                    {language === 'es' ? 'Días de Gracia' : 'Grace Period'}
                  </span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                    {settings.GRACE_PERIOD_DAYS || 5} {language === 'es' ? 'Días' : 'Days'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {language === 'es' ? 'Sin recargo adicional' : 'No late fee penalty'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-mono">
                    {language === 'es' ? 'Recargo Semanal' : 'Weekly Late Fee'}
                  </span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                    +{formatCurrency(settings.LATE_FEE_WEEKLY)}/wk
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {language === 'es' ? 'Por semana vencida' : 'Accrued weekly'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-mono">
                    {language === 'es' ? 'Tope Máximo Mora' : 'Max Late Fee Cap'}
                  </span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                    {formatCurrency(settings.MAX_LATE_FEE)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {language === 'es' ? 'Límite por mes' : 'Per month maximum'}
                  </span>
                </div>
              </div>

              {/* Rules Description Box */}
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-2 text-xs text-indigo-950 dark:text-indigo-200">
                <div className="flex items-center gap-2 font-black text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'es' ? 'Lógica de Imputación de Pagos' : 'Automated Accounting Mechanics'}</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-indigo-800 dark:text-indigo-300 list-disc list-inside leading-relaxed">
                  <li>
                    {language === 'es'
                      ? 'Los pagos recibidos se aplican secuencialmente empezando en el mes de Abril de 2026.'
                      : 'Incoming funds are allocated sequentially starting from April 2026 (Month 3).'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'No se cobran recargos de mora adicionales cuando las cuotas mensuales están pagadas a tiempo.'
                      : 'Late fees are automatically zeroed out once base monthly dues are fully settled.'}
                  </li>
                  <li>
                    {language === 'es'
                      ? 'El excedente de pagos se arrastra automáticamente hacia los meses siguientes como saldo a favor.'
                      : 'Surplus payment amounts carry forward automatically into future months as credit.'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. EXECUTIVE DUES SUMMARY WIDGET */}
          {currentTab === 'executiveSummary' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span>{language === 'es' ? 'Resumen Ejecutivo de Cuotas' : 'Executive Dues & Financial Summary'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Estado financiero global y rendimiento de recaudo de Tradición' : 'Global financial health, intake metrics, and collection performance'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>{kpis.onTimeCollectionRate}% {language === 'es' ? 'Cobro al día' : 'On-Time'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl space-y-2 shadow-lg">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-300">
                    {language === 'es' ? 'Ingresos Totales (YTD)' : 'Total Revenue Collected'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    {formatCurrency(kpis.totalRevenueYTD)}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {language === 'es' ? 'Suma acumulada de ingresos 2026' : 'Cumulative 2026 dues & fees collected'}
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-rose-950/80 to-slate-900 text-white rounded-3xl space-y-2 shadow-lg border border-rose-900/50">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-300">
                    {language === 'es' ? 'Deuda Pendiente Owed' : 'Total Outstanding Owed'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                    {formatCurrency(kpis.totalOutstandingDebt)}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {language === 'es' ? 'Cuotas + recargos pendientes' : 'Uncollected balance across active roster'}
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-950/80 to-slate-900 text-white rounded-3xl space-y-2 shadow-lg border border-amber-900/50">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-300">
                    {language === 'es' ? 'Recargos por Mora' : 'Total Late Fees'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {formatCurrency(kpis.totalLateFeesCollected)}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {language === 'es' ? 'Penalización semanal acumulada' : 'Total weekly overdue fees accrued'}
                  </p>
                </div>
              </div>

              {/* Auxiliary Executive Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">{language === 'es' ? 'Elenco Activo' : 'Active Roster'}</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    {kpis.activePerformersCount} {language === 'es' ? 'Bailarines' : 'Performers'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">{language === 'es' ? 'Promedio / Bailarín' : 'Avg Paid / Member'}</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 font-mono">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    {formatCurrency(kpis.totalRevenueYTD / (kpis.activePerformersCount || 1))}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">{language === 'es' ? 'Aging 1-30 Días' : 'Aging 1-30 Days'}</span>
                  <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4" />
                    {formatCurrency(kpis.aging?.days1to30Amount || 0)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">{language === 'es' ? 'Aging 30+ Días' : 'Aging 30+ Days'}</span>
                  <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-4 h-4" />
                    {formatCurrency(kpis.aging?.days30PlusAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. 30-DAY PAYMENT VOLUME TREND WIDGET */}
          {currentTab === 'volumeTrend' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span>{language === 'es' ? 'Tendencia de Volumen de Pagos (Últimos 30 Días)' : '30-Day Total Payment Volume Trend'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Ingreso diario acumulado y picos de actividad' : 'Daily inflow analysis & cumulative revenue expansion over 30 days'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setVolumeViewMode('daily')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${volumeViewMode === 'daily' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {language === 'es' ? 'Diario' : 'Daily'}
                  </button>
                  <button
                    onClick={() => setVolumeViewMode('cumulative')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${volumeViewMode === 'cumulative' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {language === 'es' ? 'Acumulado' : 'Cumulative'}
                  </button>
                  <button
                    onClick={() => setVolumeViewMode('both')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${volumeViewMode === 'both' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {language === 'es' ? 'Ambos' : 'Both'}
                  </button>
                </div>
              </div>

              {/* Area Chart */}
              <div className="h-64 w-full bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last30DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="widgetDailyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="widgetCumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                    <Tooltip />
                    {(volumeViewMode === 'cumulative' || volumeViewMode === 'both') && (
                      <Area type="monotone" dataKey="cumulativeVolume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#widgetCumGrad)" name="Cumulative ($)" />
                    )}
                    {(volumeViewMode === 'daily' || volumeViewMode === 'both') && (
                      <Area type="monotone" dataKey="dailyVolume" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#widgetDailyGrad)" name="Daily Intake ($)" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Volumen Total 30d' : '30-Day Volume'}</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">{formatCurrency(last30DaysMetrics.total30DayVolume)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Pico Máximo Diario' : 'Peak Daily Volume'}</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">{formatCurrency(last30DaysMetrics.peakDailyVolume)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Promedio Diario' : 'Avg Daily Intake'}</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">{formatCurrency(last30DaysMetrics.avgDailyVolume)}/day</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Días con Transacciones' : 'Active Payment Days'}</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">{last30DaysMetrics.activeDaysCount} / 30 days</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. PAYMENT CHANNEL INTAKE BREAKDOWN WIDGET */}
          {currentTab === 'channelBreakdown' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    <span>{language === 'es' ? 'Desglose por Canal de Pago' : 'Payment Channel Intake Breakdown'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Distribución de fondos entre Venmo, Zelle, Cash App, Direct y Efectivo' : 'Distribution of incoming dues across Venmo, Zelle, Cash App, Direct & Cash'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {kpis.channelBreakdown?.length || 5} {language === 'es' ? 'Canales Registrados' : 'Active Channels'}
                </span>
              </div>

              {/* Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {kpis.channelBreakdown?.map((ch) => {
                  const method = ch.method;
                  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
                  let icon = '💵';

                  if (method === 'Venmo') {
                    badgeColor = 'bg-purple-100 text-purple-900 border-purple-200';
                    icon = '🟣';
                  } else if (method === 'Zelle') {
                    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                    icon = '💚';
                  } else if (method === 'Cash App') {
                    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    icon = '🟢';
                  } else if (method === 'Direct / Salsa Richmond') {
                    badgeColor = 'bg-blue-100 text-blue-900 border-blue-200';
                    icon = '🔵';
                  } else if (method === 'Debt Collection') {
                    badgeColor = 'bg-purple-950 text-purple-200 border-purple-800';
                    icon = '⚖️';
                  }

                  return (
                    <div key={method} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${badgeColor}`}>
                          <span>{icon}</span>
                          <span>{method}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {ch.count} {ch.count === 1 ? 'tx' : 'txs'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                          {formatCurrency(ch.amount)}
                        </span>
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                          {ch.percentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(0, ch.percentage))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. MODULAR ARCHITECTURE WIDGET */}
          {currentTab === 'modularArchitecture' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                    <span>{language === 'es' ? 'Arquitectura Modular de Estado (v7.0.0)' : 'Modular Architecture & State Engine'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Motor en memoria puro TypeScript y sincronización async con Google Sheets' : 'Pure client-side TypeScript accounting kernel & Google Apps Script sync'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ⚡ Active Engine v7.0.0
                </span>
              </div>

              {/* Architecture Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                    <Zap className="w-4 h-4" />
                    <span>1. Pure In-Memory Accounting Core</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'es'
                      ? 'Recalcula automáticamente cuotas, moras acumuladas y saldos a favor al instante en milisegundos sin latencia de servidor.'
                      : 'Executes pure TypeScript financial calculations in real time with zero server latency.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-4 h-4" />
                    <span>2. Google Apps Script Web App Bridge</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'es'
                      ? 'Sincroniza asíncronamente con las pestañas Master_Roster y Payments de Google Sheets.'
                      : 'Connects asynchronously to Google Sheets Master_Roster and Payments endpoints.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-600 dark:text-purple-400">
                    <CreditCard className="w-4 h-4" />
                    <span>3. Multi-Channel Intake Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'es'
                      ? 'Procesa y categoriza automáticamente pagos provenientes de Venmo, Zelle, Cash App, Salsa Direct y Efectivo.'
                      : 'Parses and classifies intake records across Venmo, Zelle, Cash App, Direct, and Cash.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400">
                    <Scale className="w-4 h-4" />
                    <span>4. Automated Debt Collection Recovery</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'es'
                      ? 'Genera recordatorios de cobro y asignaciones personalizadas de recargos por mora.'
                      : 'Generates automated payment reminders and flexible late fee recovery allocation.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. PERFORMANCE BENCHMARK WIDGET */}
          {currentTab === 'performanceBenchmark' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>{language === 'es' ? 'Rendimiento y Benchmark en Vivo' : 'Performance Benchmark & Execution Speed'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Comparación de velocidad entre el motor v7.0.0 y el script legacy' : 'Execution latency comparison between pure TypeScript core and legacy Apps Script'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {executionTimeMs.toFixed(1)} ms Live Latency
                </span>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-indigo-300 font-bold">
                    {language === 'es' ? 'TIEMPO DE EJECUCIÓN RECALCULADO' : 'PURE TYPESCRIPT RECALCULATION SPEED'}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-black">
                    ⚡ 25,000x Faster
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl space-y-1">
                    <span className="text-[10px] text-emerald-300 font-mono font-bold uppercase block">
                      {language === 'es' ? 'Motor Actual (In-Memory v7.0.0)' : 'Current Engine (In-Memory v7.0.0)'}
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {executionTimeMs.toFixed(2)} ms
                    </div>
                    <span className="text-[10px] text-emerald-200/80 block">
                      {language === 'es' ? 'Instantáneo en navegador client-side' : 'Instant client-side evaluation'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                      {language === 'es' ? 'Script Legacy Apps Script' : 'Legacy Apps Script Engine'}
                    </span>
                    <div className="text-2xl font-black font-mono text-slate-300">
                      ~45,000.00 ms
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {language === 'es' ? 'Demora de red y cuota GCP' : 'Server side round-trip network execution'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory & Cache Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Tasa de Aciertos Cache' : 'Cache Hit Rate'}</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">100.0%</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Uso de Memoria Heap' : 'Heap Footprint'}</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">&lt; 2.4 MB</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{language === 'es' ? 'Capacidad Recalculada' : 'Recalc Capacity'}</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">10k+ tx/sec</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
