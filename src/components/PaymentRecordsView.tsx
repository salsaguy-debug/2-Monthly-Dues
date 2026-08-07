import React, { useState, useMemo } from 'react';
import { PaymentRecord, PaymentMethod, MatchStatus } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Mail, 
  Tag, 
  Link2,
  RefreshCw,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SearchableEmailDropdown, DropdownOption } from './SearchableEmailDropdown';
import { sanitizePayerName } from '../utils/payerSanitizer';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { detectPaymentMethod } from '../utils/paymentChannelDetector';

type SortField = 'transactionRef' | 'email' | 'payerName' | 'subject' | 'date' | 'amount' | 'paymentMethod' | 'matchStatus';

interface PaymentRecordsViewProps {
  payments: PaymentRecord[];
  onOpenAddPayment: () => void;
  onUpdatePaymentStatus: (id: string, newStatus: MatchStatus, newEmail?: string) => void;
  activePerformersEmails: string[];
  onOpenGmailSync?: () => void;
  onEditPayment?: (payment: PaymentRecord) => void;
  onDeletePayment?: (id: string) => void;
}

export const PaymentRecordsView: React.FC<PaymentRecordsViewProps> = ({
  payments,
  onOpenAddPayment,
  onUpdatePaymentStatus,
  activePerformersEmails,
  onOpenGmailSync,
  onEditPayment,
  onDeletePayment
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | PaymentMethod>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [relinkId, setRelinkId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [deletingPayment, setDeletingPayment] = useState<PaymentRecord | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Collect unique list of emails for email dropdown
  const emailOptions = useMemo(() => {
    const emailToNameMap = new Map<string, string>();
    
    payments.forEach(p => {
      if (p.email && p.email.trim()) {
        const cleanEmail = p.email.toLowerCase().trim();
        if (p.payerName && p.payerName.trim() && p.payerName !== 'Unmatched Payer') {
          emailToNameMap.set(cleanEmail, p.payerName.trim());
        }
      }
    });

    const emailSet = new Set<string>(activePerformersEmails.map(e => e.toLowerCase().trim()));
    payments.forEach(p => {
      if (p.email && p.email.trim()) {
        emailSet.add(p.email.toLowerCase().trim());
      }
    });

    return Array.from(emailSet).sort().map(email => {
      const name = emailToNameMap.get(email);
      return {
        email,
        label: name ? `${name} (${email})` : email
      };
    });
  }, [activePerformersEmails, payments]);

  // Count payment records by status based on search, email, and method criteria
  const statusCounts = useMemo(() => {
    const base = payments.filter(p => {
      const channel = detectPaymentMethod(p.paymentMethod, p.subject, p.from, p.notes, p.transactionRef);
      const amt = extractPaymentAmount(p.amount, p.subject, p.notes);
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || 
        (p.payerName || '').toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term) ||
        (p.subject || '').toLowerCase().includes(term) ||
        (p.transactionRef || '').toLowerCase().includes(term) ||
        (p.notes || '').toLowerCase().includes(term) ||
        (p.from || '').toLowerCase().includes(term) ||
        channel.toLowerCase().includes(term) ||
        (p.matchStatus || '').toLowerCase().includes(term) ||
        amt.toString().includes(term) ||
        `$${amt}`.includes(term);

      const matchesEmail = emailFilter === 'ALL' || 
        (p.email || '').toLowerCase().trim() === emailFilter.toLowerCase().trim();

      const matchesMethod = methodFilter === 'ALL' || 
        channel.toLowerCase().trim() === methodFilter.toLowerCase().trim();

      return matchesSearch && matchesEmail && matchesMethod;
    });

    return {
      ALL: base.length,
      Linked: base.filter(p => p.matchStatus === 'Linked').length,
      'Review Needed': base.filter(p => p.matchStatus === 'Review Needed').length,
      Unresolved: base.filter(p => p.matchStatus === 'Unresolved').length,
    };
  }, [payments, searchTerm, emailFilter, methodFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredPayments = useMemo(() => {
    const matched = payments.filter(p => {
      const channel = detectPaymentMethod(p.paymentMethod, p.subject, p.from, p.notes, p.transactionRef);
      const amt = extractPaymentAmount(p.amount, p.subject, p.notes);
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || 
        (p.payerName || '').toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term) ||
        (p.subject || '').toLowerCase().includes(term) ||
        (p.transactionRef || '').toLowerCase().includes(term) ||
        (p.notes || '').toLowerCase().includes(term) ||
        (p.from || '').toLowerCase().includes(term) ||
        channel.toLowerCase().includes(term) ||
        (p.matchStatus || '').toLowerCase().includes(term) ||
        amt.toString().includes(term) ||
        `$${amt}`.includes(term);

      const matchesEmail = emailFilter === 'ALL' || 
        (p.email || '').toLowerCase().trim() === emailFilter.toLowerCase().trim();

      const matchesMethod = methodFilter === 'ALL' || 
        channel.toLowerCase().trim() === methodFilter.toLowerCase().trim();

      const matchesStatus = statusFilter === 'ALL' || 
        (p.matchStatus || '').toLowerCase().trim() === statusFilter.toLowerCase().trim();

      return matchesSearch && matchesEmail && matchesMethod && matchesStatus;
    });

    return [...matched].sort((a, b) => {
      if (sortField === 'amount') {
        const aAmt = extractPaymentAmount(a.amount, a.subject, a.notes);
        const bAmt = extractPaymentAmount(b.amount, b.subject, b.notes);
        return sortDirection === 'asc' ? aAmt - bAmt : bAmt - aAmt;
      } else if (sortField === 'paymentMethod') {
        const aChan = detectPaymentMethod(a.paymentMethod, a.subject, a.from, a.notes, a.transactionRef);
        const bChan = detectPaymentMethod(b.paymentMethod, b.subject, b.from, b.notes, b.transactionRef);
        return sortDirection === 'asc' ? aChan.localeCompare(bChan) : bChan.localeCompare(aChan);
      } else {
        let aVal: any = a[sortField] || '';
        let bVal: any = b[sortField] || '';
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [payments, searchTerm, emailFilter, methodFilter, statusFilter, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 inline ml-1 opacity-60" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400 inline ml-1 font-bold" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-400 inline ml-1 font-bold" />;
  };

  const getMethodBadge = (method: PaymentMethod, targetFeeType?: string) => {
    switch (method) {
      case 'Venmo':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">🟣 Venmo</span>;
      case 'Zelle':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">💚 Zelle</span>;
      case 'Cash App':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Cash App</span>;
      case 'Direct / Salsa Richmond':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">🔵 Direct / Salsa Richmond</span>;
      case 'Manual / Cash':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">💵 Manual / Cash</span>;
      case 'Debt Collection':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 w-fit">
            ⚖️ Debt Collection
            {targetFeeType === 'Late Fees' && <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded-xs">Late Fees</span>}
          </span>
        );
    }
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'Linked':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('statusLinked')}</span>;
      case 'Review Needed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3 text-amber-600" /> {t('statusReview')}</span>;
      case 'Unresolved':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3 text-rose-600" /> {t('statusUnresolved')}</span>;
    }
  };

  const relinkOptions = useMemo(() => {
    return activePerformersEmails.map(email => {
      const opt = emailOptions.find(o => o.email.toLowerCase() === email.toLowerCase());
      return {
        email,
        label: opt ? opt.label : email
      };
    });
  }, [activePerformersEmails, emailOptions]);

  const handleRelinkConfirm = (paymentId: string) => {
    const targetEmail = selectedEmail || (activePerformersEmails.length > 0 ? activePerformersEmails[0] : '');
    if (!targetEmail) return;
    onUpdatePaymentStatus(paymentId, 'Linked', targetEmail);
    setRelinkId(null);
    setSelectedEmail('');
  };

  return (
    <div className="space-y-4">
      {/* Status Filtering Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-2 transition-colors">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{language === 'es' ? 'Todos los Pagos' : 'All Payments'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
            statusFilter === 'ALL' ? 'bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {statusCounts.ALL}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Linked')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'Linked'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === 'Linked' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <span>{language === 'es' ? 'Coincididos (Matched)' : 'Matched (Linked)'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
            statusFilter === 'Linked' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200'
          }`}>
            {statusCounts.Linked}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Review Needed')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'Review Needed'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <AlertCircle className={`w-3.5 h-3.5 ${statusFilter === 'Review Needed' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
          <span>{language === 'es' ? 'Pendientes (Pending)' : 'Pending (Review)'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
            statusFilter === 'Review Needed' ? 'bg-amber-600 text-white' : 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
          }`}>
            {statusCounts['Review Needed']}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Unresolved')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'Unresolved'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50/70 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <XCircle className={`w-3.5 h-3.5 ${statusFilter === 'Unresolved' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
          <span>{language === 'es' ? 'Marcados (Flagged)' : 'Flagged (Unresolved)'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
            statusFilter === 'Unresolved' ? 'bg-rose-700 text-white' : 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200'
          }`}>
            {statusCounts.Unresolved}
          </span>
        </button>
      </div>

      {/* Controls Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Searchable Email Dropdown Filter */}
          <SearchableEmailDropdown
            value={emailFilter}
            onChange={setEmailFilter}
            options={emailOptions}
            language={language}
          />

          {/* Text Search Keyword Input */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar por pagador, ref, estado...' : 'Search by payer, ref, status...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
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

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">🔵 {t('filterAllChannels')}</option>
            <option value="Venmo">🟣 Venmo</option>
            <option value="Zelle">💚 Zelle</option>
            <option value="Cash App">🟢 Cash App</option>
            <option value="Direct / Salsa Richmond">🔵 Direct / Salsa Richmond</option>
            <option value="Manual / Cash">💵 Manual / Cash</option>
            <option value="Debt Collection">⚖️ Debt Collection</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">🔍 {language === 'es' ? 'Todos los Estados' : 'All Statuses'}</option>
            <option value="Linked">🟢 {language === 'es' ? 'Coincidido / Verificado (Matched)' : 'Matched / Linked'}</option>
            <option value="Review Needed">🟡 {language === 'es' ? 'Pendiente (Pending / Review)' : 'Pending (Review Needed)'}</option>
            <option value="Unresolved">🔴 {language === 'es' ? 'Marcado / Sin Resolver (Flagged)' : 'Flagged / Unresolved'}</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {onOpenGmailSync && (
            <button
              onClick={onOpenGmailSync}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-all border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="Gather from Gmail"
            >
              <Mail className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{language === 'es' ? 'Extraer de Gmail' : 'Sync Gmail'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddPayment}
            className="w-full md:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btnRecordIntake')}</span>
          </button>
        </div>
      </div>

      {/* Payment Intake Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
              {t('paymentsTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('paymentsSub')}
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {filteredPayments.length} {language === 'es' ? 'Registros Totales' : 'Total Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 dark:bg-slate-950 text-white font-mono uppercase text-[10px] select-none">
              <tr>
                <th onClick={() => handleSort('transactionRef')} className="p-3 cursor-pointer hover:text-indigo-300">
                  Ref # {renderSortIcon('transactionRef')}
                </th>
                <th onClick={() => handleSort('email')} className="p-3 cursor-pointer hover:text-indigo-300">
                  Email {renderSortIcon('email')}
                </th>
                <th onClick={() => handleSort('payerName')} className="p-3 cursor-pointer hover:text-indigo-300">
                  {t('colPayer')} {renderSortIcon('payerName')}
                </th>
                <th onClick={() => handleSort('subject')} className="p-3 cursor-pointer hover:text-indigo-300">
                  {t('colSubject')} {renderSortIcon('subject')}
                </th>
                <th onClick={() => handleSort('date')} className="p-3 cursor-pointer hover:text-indigo-300">
                  {t('colDate')} {renderSortIcon('date')}
                </th>
                <th onClick={() => handleSort('amount')} className="p-3 text-right cursor-pointer hover:text-indigo-300">
                  {t('colAmount')} {renderSortIcon('amount')}
                </th>
                <th onClick={() => handleSort('paymentMethod')} className="p-3 cursor-pointer hover:text-indigo-300">
                  {t('colChannel')} {renderSortIcon('paymentMethod')}
                </th>
                <th onClick={() => handleSort('matchStatus')} className="p-3 cursor-pointer hover:text-indigo-300">
                  {t('colMatchStatus')} {renderSortIcon('matchStatus')}
                </th>
                <th className="p-3 text-center">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredPayments.map((p, idx) => {
                const amt = extractPaymentAmount(p.amount, p.subject, p.notes);
                const channel = detectPaymentMethod(p.paymentMethod, p.subject, p.from, p.notes, p.transactionRef);
                return (
                  <tr key={`pay-row-${p.id || idx}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-100">{p.transactionRef}</td>
                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{p.email}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{sanitizePayerName(p.payerName, p.subject, p.email)}</td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300 max-w-xs truncate" title={p.subject}>
                      {p.subject}
                      {p.notes && <p className="text-[10px] text-indigo-600 dark:text-indigo-400 italic font-normal">{p.notes}</p>}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{p.date}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center justify-end px-2.5 py-1 rounded-md font-mono font-extrabold text-xs tracking-tight ${
                        amt > 0 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {formatCurrency(amt)}
                      </span>
                    </td>
                    <td className="p-3">{getMethodBadge(channel, p.targetFeeType)}</td>
                    <td className="p-3">{getStatusBadge(p.matchStatus)}</td>
                    <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onEditPayment && (
                        <button
                          onClick={() => onEditPayment(p)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                          title="Edit payment details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {p.matchStatus !== 'Linked' && (
                        <button
                          onClick={() => {
                            setRelinkId(p.id);
                            const foundEmail = p.email && p.email !== 'unknown.payer@gmail.com' && activePerformersEmails.some(e => e.toLowerCase() === p.email.toLowerCase())
                              ? p.email
                              : (activePerformersEmails[0] || '');
                            setSelectedEmail(foundEmail);
                          }}
                          className="px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 cursor-pointer"
                          title="Link to performer"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>{t('btnLink')}</span>
                        </button>
                      )}

                      {onDeletePayment && (
                        <button
                          onClick={() => setDeletingPayment(p)}
                          className="p-1.5 text-rose-600 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                          title="Delete payment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relink Modal */}
      {relinkId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4 text-left transition-colors">
            <button
              onClick={() => setRelinkId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {language === 'es' ? 'Vincular Pago a Integrante' : 'Link Payment to Performer'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'es'
                    ? 'Asocie esta transacción a un perfil para actualizar su libro contable.'
                    : 'Associate this transaction intake with a performer profile.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                  {language === 'es' ? 'Email del Integrante' : 'Target Performer Email'}
                </label>
                <SearchableEmailDropdown
                  value={selectedEmail || (activePerformersEmails[0] || '')}
                  onChange={val => setSelectedEmail(val)}
                  options={relinkOptions}
                  language={language}
                  placeholder={language === 'es' ? 'Seleccionar integrante...' : 'Select performer...'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setRelinkId(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleRelinkConfirm(relinkId)}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Vincular y Recalcular' : 'Link & Recalculate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Warning Confirmation Modal */}
      {deletingPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-rose-200 dark:border-rose-900/50 shadow-2xl relative space-y-4 text-left transition-colors">
            <button
              onClick={() => setDeletingPayment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'es' ? '⚠️ Confirmar Eliminación de Pago' : '⚠️ Confirm Payment Deletion'}
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                  {language === 'es' ? 'Acción permanente e irreversible' : 'Permanent and irreversible action'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl space-y-2 text-xs text-rose-900 dark:text-rose-200">
              <p className="font-bold">
                {language === 'es'
                  ? `¿Está seguro de que desea eliminar el pago de $${deletingPayment.amount} (${deletingPayment.payerName || deletingPayment.email})?`
                  : `Are you sure you want to delete the payment record of $${deletingPayment.amount} (${deletingPayment.payerName || deletingPayment.email})?`}
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                {language === 'es'
                  ? 'Esta transacción se eliminará del libro mayor y se recalcularán los saldos pendientes.'
                  : 'This transaction record will be permanently deleted from ledger balances and calculations.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeletingPayment(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (onDeletePayment && deletingPayment) {
                    onDeletePayment(deletingPayment.id);
                  }
                  setDeletingPayment(null);
                }}
                className="px-4 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Eliminar Pago' : 'Yes, Delete Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
