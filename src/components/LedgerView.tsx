import React, { useState, useMemo } from 'react';
import { LedgerRow, LedgerMonth } from '../types';
import { formatCurrency, MONTH_SHORT_NAMES } from '../utils/dateUtils';
import { 
  Search, 
  Download, 
  Filter, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Eye,
  UserX,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Edit2,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SearchableEmailDropdown, DropdownOption } from './SearchableEmailDropdown';

type SortField = 'name' | 'email' | 'status' | 'totalPaid2026' | 'totalLateFees' | 'owesYear';

interface LedgerViewProps {
  ledgerRows: LedgerRow[];
  activePerformers: LedgerRow[];
  excludedPerformers: LedgerRow[];
  onEditPerformer?: (performer: { name: string; email: string; phone?: string }) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  ledgerRows,
  activePerformers,
  excludedPerformers,
  onEditPerformer
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Current' | '1-30 Days Overdue' | '30+ Days Overdue' | 'Excluded'>('ALL');
  const [selectedRow, setSelectedRow] = useState<LedgerRow | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const emailOptions = useMemo<DropdownOption[]>(() => {
    return activePerformers.map(row => ({
      email: row.email,
      name: row.name,
      label: row.name ? `${row.name} (${row.email})` : row.email
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

  const filteredRows = useMemo(() => {
    const matched = ledgerRows.filter(row => {
      if (row.isExcluded) return false;
      const matchesEmail = emailFilter === 'ALL' || row.email.toLowerCase() === emailFilter.toLowerCase();
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
                            (row.name || '').toLowerCase().includes(q) ||
                            (row.email || '').toLowerCase().includes(q) ||
                            (row.phone || '').toLowerCase().includes(q) ||
                            (row.status || '').toLowerCase().includes(q) ||
                            `$${row.totalPaid2026}`.includes(q) ||
                            `$${row.owesYear}`.includes(q) ||
                            row.totalPaid2026.toString().includes(q) ||
                            row.owesYear.toString().includes(q);
      
      if (!matchesEmail || !matchesSearch) return false;
      if (statusFilter === 'ALL') return true;
      return row.status === statusFilter;
    });

    return [...matched].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

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
  }, [ledgerRows, emailFilter, searchTerm, statusFilter, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 inline ml-1 opacity-60" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400 inline ml-1 font-bold" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-400 inline ml-1 font-bold" />;
  };

  const handleExportCSV = () => {
    let csv = 'Email,Name,Status,Total Paid 2026,Total Late Fees,Owes Year';
    MONTH_SHORT_NAMES.forEach(m => {
      csv += `,${m} Paid,${m} Base,${m} Late,${m} Bal`;
    });
    csv += '\n';

    filteredRows.forEach(row => {
      csv += `"${row.email}","${row.name}","${row.status}",${row.totalPaid2026},${row.totalLateFees},${row.owesYear}`;
      row.months.forEach(m => {
        csv += `,${m.paid},${m.baseDues},${m.lateFee},${m.balance}`;
      });
      csv += '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradicion_2026_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Searchable Email Dropdown Filter */}
          <SearchableEmailDropdown
            value={emailFilter}
            onChange={setEmailFilter}
            options={emailOptions}
            language={language}
          />

          {/* Text Search Keyword Field */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar integrante, estado, monto...' : 'Search performer, status, amount...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-2" />
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {language === 'es' ? `Todos (${activePerformers.length})` : `All (${activePerformers.length})`}
            </button>
            <button
              onClick={() => setStatusFilter('Current')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Current' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50'
              }`}
            >
              🟢 {t('statusCurrent')}
            </button>
            <button
              onClick={() => setStatusFilter('1-30 Days Overdue')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === '1-30 Days Overdue' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-950/50'
              }`}
            >
              🟡 {language === 'es' ? 'En Mora' : 'Overdue'}
            </button>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="w-full md:w-auto px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span>{language === 'es' ? 'Exportar CSV' : 'Export Ledger CSV'}</span>
        </button>
      </div>

      {/* 2026 Matrix Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
              {t('ledgerTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {t('ledgerSub')}
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            {language === 'es' ? `Mostrando ${filteredRows.length} Registros` : `Showing ${filteredRows.length} Records`}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 dark:bg-slate-950 text-white sticky top-0 z-20 shadow-sm select-none">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="p-3 sticky left-0 bg-slate-900 dark:bg-slate-950 z-30 font-mono uppercase text-[10px] min-w-[180px] cursor-pointer hover:text-indigo-300 transition-colors"
                >
                  Performer Name {renderSortIcon('name')}
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="p-3 font-mono uppercase text-[10px] min-w-[200px] cursor-pointer hover:text-indigo-300 transition-colors"
                >
                  Email {renderSortIcon('email')}
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="p-3 text-center font-mono uppercase text-[10px] min-w-[110px] cursor-pointer hover:text-indigo-300 transition-colors"
                >
                  Status {renderSortIcon('status')}
                </th>
                <th 
                  onClick={() => handleSort('totalPaid2026')}
                  className="p-3 text-right font-mono uppercase text-[10px] text-emerald-400 font-bold min-w-[110px] cursor-pointer hover:text-emerald-300 transition-colors"
                >
                  Total Paid {renderSortIcon('totalPaid2026')}
                </th>
                <th 
                  onClick={() => handleSort('totalLateFees')}
                  className="p-3 text-right font-mono uppercase text-[10px] text-amber-400 font-bold min-w-[100px] cursor-pointer hover:text-amber-300 transition-colors"
                >
                  Total Late {renderSortIcon('totalLateFees')}
                </th>
                <th 
                  onClick={() => handleSort('owesYear')}
                  className="p-3 text-right font-mono uppercase text-[10px] text-rose-400 font-bold min-w-[110px] cursor-pointer hover:text-rose-300 transition-colors"
                >
                  Owes Year {renderSortIcon('owesYear')}
                </th>

                {/* 12 Months Columns */}
                {MONTH_SHORT_NAMES.map((mName, idx) => (
                  <th key={`hdr-month-${mName}-${idx}`} className="p-3 text-center border-l border-slate-800 font-mono text-[10px] uppercase min-w-[140px]">
                    <span className={idx >= 3 ? 'text-indigo-300 font-bold' : 'text-slate-400'}>
                      {mName} 2026 {idx >= 3 ? '($15)' : '(Exempt)'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto p-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                        <Filter className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                          {language === 'es' ? 'No se encontraron registros en el libro mayor.' : 'No performers found matching search criteria.'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {language === 'es'
                            ? 'Intente modificar la búsqueda o limpiar los filtros seleccionados.'
                            : 'Try adjusting your search terms or clearing active filters.'}
                        </p>
                      </div>

                      {(searchTerm.trim() || emailFilter !== 'ALL' || statusFilter !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setEmailFilter('ALL');
                            setStatusFilter('ALL');
                          }}
                          className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>{language === 'es' ? 'Limpiar Filtros y Búsqueda' : 'Clear Filters & Search'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                <tr 
                  key={`ledger-row-${row.email}-${idx}`} 
                  className={`hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    row.isExcluded ? 'bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500' : ''
                  }`}
                  onClick={() => setSelectedRow(row)}
                >
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-xs flex items-center justify-between gap-2">
                    <span className="truncate">{row.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {onEditPerformer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPerformer({ name: row.name, email: row.email });
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded cursor-pointer"
                          title="Edit performer"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                      <button className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Eye className="w-3.5 h-3.5 inline" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-500 dark:text-slate-400 text-[11px] truncate">{row.email}</td>
                  
                  <td className="p-3 text-center">
                    {row.isExcluded ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-600">
                        EXCLUDED
                      </span>
                    ) : row.status === 'Current' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🟢 Current
                      </span>
                    ) : row.status === '1-30 Days Overdue' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        🟡 1-30d
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        🔴 30d+
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right font-mono font-extrabold text-emerald-600">
                    {formatCurrency(row.totalPaid2026)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600">
                    {row.totalLateFees > 0 ? formatCurrency(row.totalLateFees) : '-'}
                  </td>
                  <td className={`p-3 text-right font-mono font-extrabold ${row.owesYear > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {formatCurrency(row.owesYear)}
                  </td>

                  {/* Monthly Cells */}
                  {row.months.map((m, mIdx) => (
                    <td 
                      key={`month-cell-${m.monthIndex}-${mIdx}`} 
                      className={`p-2 border-l border-slate-100 text-center font-mono text-[11px] ${
                        m.isOverdue ? 'bg-rose-50/60' : m.paid > 0 ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Paid:</span>
                          <span className={m.paid > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            ${m.paid}
                          </span>
                        </div>
                        {m.lateFee > 0 && (
                          <div className="flex justify-between text-[10px] text-amber-600 font-bold">
                            <span>Late:</span>
                            <span>+${m.lateFee}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-slate-200 pt-0.5 font-bold">
                          <span className="text-slate-400">Bal:</span>
                          <span className={m.balance > 0 ? 'text-rose-600' : 'text-slate-700'}>
                            ${m.balance}
                          </span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Detail Inspector Drawer Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">
                  PERFORMER DRILL-DOWN
                </span>
                <h3 className="text-lg font-extrabold text-slate-800">{selectedRow.name}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedRow.email} • {selectedRow.phone || 'No phone listed'}</p>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Paid 2026</p>
                <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(selectedRow.totalPaid2026)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Late Fees</p>
                <p className="text-xl font-extrabold text-amber-600">{formatCurrency(selectedRow.totalLateFees)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Owes Year</p>
                <p className="text-xl font-extrabold text-rose-600">{formatCurrency(selectedRow.owesYear)}</p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Monthly Dues Breakdown (April – December 2026)
            </h4>
            <div className="space-y-2">
              {selectedRow.months.slice(3).map((m, mIdx) => (
                <div key={`drawer-m-${m.monthIndex}-${mIdx}`} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{m.monthName} 2026</p>
                    <p className="text-[10px] text-slate-500">
                      Due Deadline: 1st Mon ({new Date(m.dueDate).toLocaleDateString()})
                    </p>
                  </div>
                  <div className="flex gap-4 font-mono">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Base Dues</p>
                      <p className="font-semibold">${m.baseDues}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Paid</p>
                      <p className="font-bold text-emerald-600">${m.paid}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Late Fee</p>
                      <p className="font-bold text-amber-600">${m.lateFee}</p>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-3">
                      <p className="text-[10px] text-slate-400">Balance</p>
                      <p className={`font-extrabold ${m.balance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        ${m.balance}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
