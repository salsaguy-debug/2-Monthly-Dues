import React, { useState, useMemo } from 'react';
import { 
  ExecutiveKPIs, 
  SystemSettings, 
  LedgerRow,
  PaymentRecord,
  WidgetType 
} from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { 
  UserCheck,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Search,
  Edit2,
  Mail,
  X,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Users,
  ShieldAlert,
  ChevronRight,
  Phone,
  Calendar,
  Filter
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SearchableEmailDropdown, DropdownOption } from './SearchableEmailDropdown';

type SortField = 'name' | 'email' | 'totalPaid2026' | 'totalLateFees' | 'owesYear' | 'status' | 'progress';
type StatusFilterType = 'ALL' | 'Current' | '1-30 Days Overdue' | '30+ Days Overdue';

interface BentoDashboardProps {
  kpis: ExecutiveKPIs;
  settings: SystemSettings;
  executionTimeMs: number;
  activePerformers: LedgerRow[];
  payments?: PaymentRecord[];
  onNavigateTab: (tab: 'dashboard' | 'ledger' | 'payments' | 'performers' | 'settings' | 'diagnostics') => void;
  onEditPerformer?: (performer: { name: string; email: string; phone?: string }) => void;
  onOpenWidgetModal?: (widget: WidgetType) => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  kpis,
  settings,
  executionTimeMs,
  activePerformers,
  payments = [],
  onNavigateTab,
  onEditPerformer,
  onOpenWidgetModal
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [sortField, setSortField] = useState<SortField>('owesYear');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const emailOptions = useMemo<DropdownOption[]>(() => {
    return activePerformers.map(p => ({
      email: p.email,
      name: p.name,
      label: p.name ? `${p.name} (${p.email})` : p.email
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [activePerformers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {
      all: activePerformers.length,
      current: 0,
      overdue1to30: 0,
      overdue30Plus: 0,
      totalOwed: 0,
      totalPaid: 0
    };

    activePerformers.forEach(p => {
      counts.totalOwed += p.owesYear;
      counts.totalPaid += p.totalPaid2026;
      if (p.status === 'Current') counts.current++;
      else if (p.status === '1-30 Days Overdue') counts.overdue1to30++;
      else if (p.status === '30+ Days Overdue') counts.overdue30Plus++;
    });

    return counts;
  }, [activePerformers]);

  const sortedAndFilteredPerformers = useMemo(() => {
    let filtered = activePerformers;

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (emailFilter !== 'ALL') {
      filtered = filtered.filter(p => p.email.toLowerCase() === emailFilter.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const emailMatch = (p.email || '').toLowerCase().includes(q);
        const phoneMatch = (p.phone || '').toLowerCase().includes(q);
        const statusMatch = (p.status || '').toLowerCase().includes(q);
        const paidStr = `$${p.totalPaid2026}`;
        const oweStr = `$${p.owesYear}`;
        const lateStr = `$${p.totalLateFees}`;
        const amountMatch = paidStr.includes(q) || oweStr.includes(q) || lateStr.includes(q) || 
                            p.totalPaid2026.toString().includes(q) || p.owesYear.toString().includes(q);
        return nameMatch || emailMatch || phoneMatch || statusMatch || amountMatch;
      });
    }

    return [...filtered].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'progress') {
        const totalReq = (settings.BASE_DUES || 25) * 9; // April-December
        aVal = Math.min(100, Math.round((a.totalPaid2026 / (totalReq || 1)) * 100));
        bVal = Math.min(100, Math.round((b.totalPaid2026 / (totalReq || 1)) * 100));
      } else {
        aVal = a[sortField as keyof LedgerRow];
        bVal = b[sortField as keyof LedgerRow];
      }

      if (sortField === 'name' || sortField === 'email' || sortField === 'status') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      } else {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  }, [activePerformers, emailFilter, statusFilter, searchTerm, sortField, sortDirection, settings.BASE_DUES]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600 inline ml-1 font-bold" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-600 inline ml-1 font-bold" />;
  };

  const toggleExpand = (email: string) => {
    setExpandedEmail(prev => prev === email ? null : email);
  };

  return (
    <div className="space-y-6">
      {/* Prominent & Comprehensive "Performer Roster Dues Status" Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">

        {/* Controls & Filter Bar */}
        <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 shadow-2xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {language === 'es' ? 'Todos' : 'All'} ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter('Current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Current'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              <span>🟢 {t('statusCurrent')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px]">{statusCounts.current}</span>
            </button>
            <button
              onClick={() => setStatusFilter('1-30 Days Overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === '1-30 Days Overdue'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300'
              }`}
            >
              <span>🟡 {t('status1to30')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px]">{statusCounts.overdue1to30}</span>
            </button>
            <button
              onClick={() => setStatusFilter('30+ Days Overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === '30+ Days Overdue'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300'
              }`}
            >
              <span>🔴 {t('status30Plus')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px]">{statusCounts.overdue30Plus}</span>
            </button>
          </div>

          {/* Right-side Controls: Email Dropdown, Keyword Search, Open Ledger */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full xl:w-auto">
            {/* Searchable Email Dropdown Filter */}
            <div className="w-full sm:w-64 shrink-0">
              <SearchableEmailDropdown
                value={emailFilter}
                onChange={setEmailFilter}
                options={emailOptions}
                language={language}
                className="w-full"
              />
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar integrante, monto...' : 'Search dancer, balance...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-8 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Performer Roster Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider select-none">
                <th className="py-3 px-3 w-8"></th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 font-extrabold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors group"
                  title="Sort by Performer Name"
                >
                  <span className="flex items-center gap-1">
                    <span>{language === 'es' ? 'Integrante' : 'Performer Name & Email'}</span>
                    {renderSortIcon('name')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('progress')}
                  className="py-3 px-3.5 font-extrabold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors group hidden md:table-cell"
                  title="Sort by Annual Dues Paid Progress"
                >
                  <span className="flex items-center gap-1">
                    <span>{language === 'es' ? 'Progreso Cuotas' : 'Dues Paid Progress'}</span>
                    {renderSortIcon('progress')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('totalPaid2026')}
                  className="py-3 px-3.5 text-right font-extrabold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors group"
                  title="Sort by Total Paid 2026"
                >
                  <span className="flex items-center justify-end gap-1">
                    <span>{t('colTotalPaid')}</span>
                    {renderSortIcon('totalPaid2026')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('totalLateFees')}
                  className="py-3 px-3.5 text-right font-extrabold cursor-pointer hover:bg-slate-100 hover:text-indigo-700 transition-colors group"
                  title="Sort by Late Fees Accrued"
                >
                  <span className="flex items-center justify-end gap-1">
                    <span>{t('colLateFees')}</span>
                    {renderSortIcon('totalLateFees')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('owesYear')}
                  className="py-3 px-3.5 text-right font-extrabold cursor-pointer hover:bg-slate-100 hover:text-indigo-700 transition-colors group"
                  title="Sort by Owed Balance"
                >
                  <span className="flex items-center justify-end gap-1">
                    <span>{t('colOwedBalance')}</span>
                    {renderSortIcon('owesYear')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="py-3 px-3.5 text-center font-extrabold cursor-pointer hover:bg-slate-100 hover:text-indigo-700 transition-colors group"
                  title="Sort by Dues Status"
                >
                  <span className="flex items-center justify-center gap-1">
                    <span>{t('colStatus')}</span>
                    {renderSortIcon('status')}
                  </span>
                </th>
                <th className="py-3 px-3.5 text-center font-extrabold">{language === 'es' ? 'Acciones' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {sortedAndFilteredPerformers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                      <p>{language === 'es' ? 'No se encontraron integrantes con los filtros seleccionados.' : 'No performers found matching search criteria.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredPerformers.map((p, idx) => {
                  const isExpanded = expandedEmail === p.email;
                  const totalReq = (settings.BASE_DUES || 25) * 9;
                  const progressPct = Math.min(100, Math.round((p.totalPaid2026 / (totalReq || 1)) * 100));

                  return (
                    <React.Fragment key={`bento-perf-row-${p.email}-${idx}`}>
                      <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-950/30' : ''}`}>
                        {/* Expand Toggle Chevron */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(p.email)}
                            className="p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title={isExpanded ? "Hide monthly breakdown" : "Show monthly breakdown"}
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''}`} />
                          </button>
                        </td>

                        {/* Name & Contact */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                                  <span className="truncate">{p.email}</span>
                                </span>
                                {p.phone && (
                                  <span className="hidden sm:flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
                                    • <Phone className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" /> {p.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dues Progress Bar */}
                        <td className="py-3 px-3.5 hidden md:table-cell">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">{progressPct}%</span>
                              <span className="text-slate-400 dark:text-slate-500">${p.totalPaid2026} / ${totalReq}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progressPct >= 100 ? 'bg-emerald-500' : progressPct > 50 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Total Paid */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.totalPaid2026)}
                        </td>

                        {/* Late Fees */}
                        <td className="py-3 px-3.5 text-right font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {p.totalLateFees > 0 ? formatCurrency(p.totalLateFees) : '-'}
                        </td>

                        {/* Owed Balance */}
                        <td className={`py-3 px-3.5 text-right font-mono font-black ${p.owesYear > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {formatCurrency(p.owesYear)}
                        </td>

                        {/* Dues Status Badge */}
                        <td className="py-3 px-3.5 text-center">
                          {p.status === 'Current' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <span>🟢</span> {t('statusCurrent')}
                            </span>
                          )}
                          {p.status === '1-30 Days Overdue' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                              <span>🟡</span> {t('status1to30')}
                            </span>
                          )}
                          {p.status === '30+ Days Overdue' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
                              <span>🔴</span> {t('status30Plus')}
                            </span>
                          )}
                        </td>

                        {/* Quick Edit Action */}
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => onEditPerformer && onEditPerformer({ name: p.name, email: p.email, phone: p.phone })}
                            className="p-1.5 text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-all border border-indigo-200 dark:border-indigo-800 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                            title="Edit / Update performer contact details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{language === 'es' ? 'Editar' : 'Edit'}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Row: Monthly Dues Schedule Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-indigo-100 dark:border-slate-800">
                          <td colSpan={8} className="p-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-indigo-100 dark:border-slate-800 shadow-inner space-y-3">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  <span>{language === 'es' ? `Desglose Mensual de Cuotas 2026 (${p.name})` : `2026 Monthly Dues Schedule (${p.name})`}</span>
                                </span>
                                <span className="font-mono text-slate-500 dark:text-slate-400">
                                  {language === 'es' ? 'Cuota base:' : 'Base dues:'} ${settings.BASE_DUES}/mo
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 text-xs">
                                {p.months.map((m, mIdx) => {
                                  if (m.monthIndex < 3) return null; // April is monthIndex 3

                                  const isMonthPaid = m.balance <= 0 && m.paid >= m.baseDues;
                                  const isMonthOverdue = m.isOverdue;

                                  return (
                                    <div 
                                      key={`m-card-${p.email}-${mIdx}`}
                                      className={`p-2.5 rounded-xl border text-center space-y-1 ${
                                        isMonthPaid 
                                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' 
                                          : isMonthOverdue 
                                            ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300' 
                                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <p className="font-extrabold uppercase text-[10px] tracking-wider font-mono">
                                        {m.monthName}
                                      </p>
                                      <p className="text-xs font-black font-mono">
                                        ${m.paid} <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">/ ${m.baseDues}</span>
                                      </p>
                                      {m.lateFee > 0 && (
                                        <p className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                                          +${m.lateFee} {language === 'es' ? 'mora' : 'late'}
                                        </p>
                                      )}
                                      <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                                        isMonthPaid 
                                          ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200' 
                                          : isMonthOverdue 
                                            ? 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200' 
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                      }`}>
                                        {isMonthPaid 
                                          ? (language === 'es' ? 'Pagado' : 'Paid')
                                          : isMonthOverdue 
                                            ? (language === 'es' ? 'Vencido' : 'Overdue') 
                                            : (language === 'es' ? 'Pendiente' : 'Pending')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
