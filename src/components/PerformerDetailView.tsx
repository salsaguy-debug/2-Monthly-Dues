import React, { useState, useMemo } from 'react';
import { LedgerRow, PaymentRecord, SystemSettings } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { 
  User, 
  Mail, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Plus, 
  Scale, 
  Receipt, 
  Search, 
  Users, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SearchableEmailDropdown, DropdownOption } from './SearchableEmailDropdown';

interface PerformerDetailViewProps {
  activePerformers: LedgerRow[];
  payments: PaymentRecord[];
  settings: SystemSettings;
  onEditPerformer: (performer: { name: string; email: string; phone?: string }) => void;
  onOpenAddPayment: () => void;
  onOpenDebtCollection: () => void;
  onEditPayment: (payment: PaymentRecord) => void;
}

export const PerformerDetailView: React.FC<PerformerDetailViewProps> = ({
  activePerformers,
  payments,
  settings,
  onEditPerformer,
  onOpenAddPayment,
  onOpenDebtCollection,
  onEditPayment
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string>(activePerformers[0]?.email || '');

  const performerOptions = useMemo<DropdownOption[]>(() => {
    return activePerformers.map(p => ({
      email: p.email,
      name: p.name,
      label: p.name ? `${p.name} (${p.email})` : p.email
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [activePerformers]);

  // Filter performers list by search
  const filteredPerformers = useMemo(() => {
    return activePerformers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activePerformers, searchQuery]);

  // Selected performer object
  const currentPerformer = useMemo(() => {
    const target = selectedEmail.toLowerCase().trim();
    return activePerformers.find(p => p.email.toLowerCase().trim() === target) || activePerformers[0];
  }, [activePerformers, selectedEmail]);

  // Payments for current performer
  const performerPayments = useMemo(() => {
    if (!currentPerformer) return [];
    const perfEmail = currentPerformer.email.toLowerCase().trim();
    const perfName = currentPerformer.name.toLowerCase().trim();

    return payments.filter(p => {
      const pEmail = (p.email || '').toLowerCase().trim();
      if (pEmail && pEmail === perfEmail) return true;
      if (p.payerName) {
        const pName = p.payerName.toLowerCase().trim();
        const genericWords = ['cash', 'venmo', 'payment', 'direct', 'app', 'received', 'sent', 'salsa'];
        if (!genericWords.includes(pName) && pName.length >= 3) {
          if (pName === perfName || pName.includes(perfName) || perfName.includes(pName)) return true;
        }
      }
      return false;
    });
  }, [payments, currentPerformer]);

  if (!currentPerformer) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">
          {language === 'es' ? 'No se encontraron integrantes' : 'No performers found'}
        </h3>
      </div>
    );
  }

  // Calculate metrics
  const totalPaid = currentPerformer.totalPaid2026;
  const totalLate = currentPerformer.totalLateFees;
  const owes = currentPerformer.owesYear;
  const elapsedDuesMonths = Math.max(1, 7 - settings.DUES_START_MONTH); // 4 months YTD (Apr-Jul = $60)
  const totalBaseNeeded = elapsedDuesMonths * settings.BASE_DUES;
  const progressPercent = Math.min(100, Math.round((totalPaid / totalBaseNeeded) * 100));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Current':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('filterCurrent')}</span>;
      case '1-30 Days Overdue':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-600" /> {t('filter1to30')}</span>;
      case '30+ Days Overdue':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-rose-600" /> {t('filter30Plus')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar: Performer Selection List */}
      <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[780px]">
        <div className="mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{language === 'es' ? 'Directorio de Integrantes' : 'Performer Directory'}</span>
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-mono">
              {activePerformers.length} {language === 'es' ? 'Activos' : 'Active'}
            </span>
          </div>

          <div className="space-y-2">
            <SearchableEmailDropdown
              value={selectedEmail}
              onChange={(newEmail) => {
                if (newEmail !== 'ALL') setSelectedEmail(newEmail);
              }}
              options={performerOptions}
              language={language}
              placeholder={language === 'es' ? 'Seleccionar integrante...' : 'Select performer...'}
              className="w-full"
            />

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'es' ? 'Filtrar lista...' : 'Filter list...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* List of Performers */}
        <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
          {filteredPerformers.map((p, idx) => {
            const isSelected = p.email.toLowerCase() === currentPerformer.email.toLowerCase();
            return (
              <button
                key={`perf-item-${p.email}-${idx}`}
                onClick={() => setSelectedEmail(p.email)}
                className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/60'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {p.name}
                  </p>
                  <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {p.email}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono font-black block ${
                    isSelected 
                      ? 'text-white' 
                      : p.owesYear > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {p.owesYear > 0 ? `-$${p.owesYear}` : `$${p.totalPaid2026}`}
                  </span>
                  <span className={`text-[9px] uppercase font-bold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {p.owesYear > 0 ? (language === 'es' ? 'Deuda' : 'Owed') : (language === 'es' ? 'Al día' : 'Paid')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Detailed Performer Profile & Ledger */}
      <div className="lg:col-span-8 space-y-6">
        {/* Header Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full pointer-events-none -z-0" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 shrink-0">
                {currentPerformer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{currentPerformer.name}</h2>
                  {getStatusBadge(currentPerformer.status)}
                </div>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentPerformer.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => onEditPerformer({ name: currentPerformer.name, email: currentPerformer.email })}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                title="Edit Performer Information"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{language === 'es' ? 'Editar' : 'Edit Profile'}</span>
              </button>

              {currentPerformer.owesYear > 0 && (
                <button
                  onClick={onOpenDebtCollection}
                  className="px-3 py-1.5 text-xs font-black text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl border border-purple-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <Scale className="w-3.5 h-3.5 text-purple-700" />
                  <span>{language === 'es' ? 'Cobrar Deuda' : 'Collect Debt'}</span>
                </button>
              )}

              <button
                onClick={onOpenAddPayment}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Registrar Pago' : 'Record Payment'}</span>
              </button>
            </div>
          </div>

          {/* Financial KPI Cards for Performer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-0.5">
                {language === 'es' ? 'Total Pagado 2026' : 'Total Paid 2026'}
              </span>
              <span className="text-base font-black text-emerald-800 font-mono">
                {formatCurrency(totalPaid)}
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block mb-0.5">
                {language === 'es' ? 'Cargos por Mora' : 'Accrued Late Fees'}
              </span>
              <span className="text-base font-black text-amber-800 font-mono">
                {formatCurrency(totalLate)}
              </span>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-2xl">
              <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block mb-0.5">
                {language === 'es' ? 'Saldo Pendiente' : 'Outstanding Owed'}
              </span>
              <span className="text-base font-black text-rose-800 font-mono">
                {formatCurrency(owes)}
              </span>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl">
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block mb-0.5">
                {language === 'es' ? 'Progreso Temporada' : 'Season Progress'}
              </span>
              <span className="text-base font-black text-indigo-900 font-mono">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Performer 12-Month Dues Breakdown Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{language === 'es' ? 'Desglose Mensual de Cuotas (Abril - Diciembre 2026)' : 'Monthly Season Dues Ledger (Apr - Dec 2026)'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              Base: ${settings.BASE_DUES}/mo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">{language === 'es' ? 'Mes' : 'Month'}</th>
                  <th className="p-2.5 text-right">{language === 'es' ? 'Base' : 'Base Dues'}</th>
                  <th className="p-2.5 text-right">{language === 'es' ? 'Abonado' : 'Paid'}</th>
                  <th className="p-2.5 text-right">{language === 'es' ? 'Mora Acc' : 'Late Fee'}</th>
                  <th className="p-2.5 text-right">{language === 'es' ? 'Neto Pendiente' : 'Net Owed'}</th>
                  <th className="p-2.5 text-center">{language === 'es' ? 'Estado' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {currentPerformer.months.slice(settings.DUES_START_MONTH).map((m, idx) => {
                  const netOwed = Math.max(0, (m.baseDues + m.lateFee) - m.paid);
                  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.monthIndex];
                  const isPaid = netOwed === 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">
                        {monthName} 2026
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-600">
                        ${m.baseDues}
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">
                        ${m.paid}
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-600 font-bold">
                        {m.lateFee > 0 ? `+$${m.lateFee}` : '$0'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-slate-900">
                        ${netOwed}
                      </td>
                      <td className="p-2.5 text-center">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ {language === 'es' ? 'Pagado' : 'Paid'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            ! {language === 'es' ? 'Pendiente' : 'Due'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History for Selected Performer */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>{language === 'es' ? 'Historial de Pagos Vinculados' : 'Linked Payment Transaction History'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {performerPayments.length} {language === 'es' ? 'transacciones' : 'records'}
            </span>
          </div>

          {performerPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">
                {language === 'es' ? 'No hay pagos registrados para este integrante.' : 'No payment records found for this performer.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Ref #</th>
                    <th className="p-2.5">{language === 'es' ? 'Fecha' : 'Date'}</th>
                    <th className="p-2.5">{language === 'es' ? 'Asunto / Canal' : 'Subject & Channel'}</th>
                    <th className="p-2.5 text-right">{language === 'es' ? 'Monto' : 'Amount'}</th>
                    <th className="p-2.5 text-center">{language === 'es' ? 'Acción' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {performerPayments.map((p, idx) => (
                    <tr key={`perf-pay-${p.id || idx}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-mono text-indigo-600 font-bold">{p.transactionRef}</td>
                      <td className="p-2.5 font-mono text-slate-500">{p.date}</td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900">{p.subject}</p>
                        <p className="text-[10px] font-mono text-slate-400">{p.paymentMethod}</p>
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-sm whitespace-nowrap">
                        <span className="inline-flex items-center justify-end px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {formatCurrency(extractPaymentAmount(p.amount, p.subject, p.notes))}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onEditPayment(p)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-all cursor-pointer"
                          title="Edit payment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
