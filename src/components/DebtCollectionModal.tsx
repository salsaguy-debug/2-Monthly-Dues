import React, { useState, useEffect } from 'react';
import { X, Scale, AlertCircle, DollarSign, CheckCircle2, ShieldAlert, ArrowRight, Save, UserCheck, Tag, Receipt } from 'lucide-react';
import { LedgerRow, PaymentRecord, FeeAllocationTarget } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';

interface DebtCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePerformers: LedgerRow[];
  onAddPayment: (payment: PaymentRecord) => void;
  debtCollectionFee?: number;
}

const DRAFT_KEY = 'tradicion_draft_debt_collection';

export const DebtCollectionModal: React.FC<DebtCollectionModalProps> = ({
  isOpen,
  onClose,
  activePerformers,
  onAddPayment,
  debtCollectionFee = 15.0
}) => {
  const { language } = useLanguage();

  // Filter only delinquent performers
  const delinquentPerformers = activePerformers.filter(p => p.owesYear > 0);

  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const draft = getSavedDraft();

  const [selectedEmail, setSelectedEmail] = useState<string>(() => draft?.selectedEmail || delinquentPerformers[0]?.email || '');
  const [collectionAmount, setCollectionAmount] = useState<number>(() => draft?.collectionAmount !== undefined ? draft.collectionAmount : (delinquentPerformers[0]?.owesYear || 15));
  const [targetFeeType, setTargetFeeType] = useState<FeeAllocationTarget>(() => draft?.targetFeeType || 'All');
  const [agencyNotes, setAgencyNotes] = useState<string>(() => draft?.agencyNotes || 'Agency Recovery / Direct Settlement');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Save draft whenever fields change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        selectedEmail,
        collectionAmount,
        targetFeeType,
        agencyNotes
      }));
    } catch (e) {
      console.error(e);
    }
  }, [selectedEmail, collectionAmount, targetFeeType, agencyNotes]);

  if (!isOpen) return null;

  const handleSelectPerformer = (email: string) => {
    setSelectedEmail(email);
    const matched = delinquentPerformers.find(p => p.email === email);
    if (matched) {
      setCollectionAmount(matched.owesYear);
    }
  };

  const handleQuickCollectLateFees = (performer: LedgerRow) => {
    if (performer.totalLateFees <= 0) {
      alert(language === 'es' ? 'Este integrante no tiene cargos por mora acumulados.' : 'This performer has no accrued late fees.');
      return;
    }

    const rec: PaymentRecord = {
      id: `COL-FEE-${Math.floor(1000 + Math.random() * 9000)}`,
      email: performer.email,
      payerName: performer.name,
      subject: `Debt Collection - Late Fees Settlement ($${performer.totalLateFees})`,
      from: 'debt.collection@tradicion.org',
      date: new Date().toISOString().slice(0, 10),
      amount: performer.totalLateFees,
      transactionRef: `REC-LF-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod: 'Debt Collection',
      matchStatus: 'Linked',
      targetFeeType: 'Late Fees',
      notes: `Recovered $${performer.totalLateFees} late fees via Debt Collection Process`
    };

    onAddPayment(rec);
    setSuccessMessage(language === 'es' 
      ? `🟢 Se registraron $${performer.totalLateFees} para ${performer.name} aplicados a Cargos por Mora.`
      : `🟢 Successfully recovered $${performer.totalLateFees} applied to Late Fees for ${performer.name}.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleQuickCollectFullDebt = (performer: LedgerRow) => {
    const rec: PaymentRecord = {
      id: `COL-FULL-${Math.floor(1000 + Math.random() * 9000)}`,
      email: performer.email,
      payerName: performer.name,
      subject: `Debt Collection - Full Outstanding Recovery ($${performer.owesYear})`,
      from: 'debt.collection@tradicion.org',
      date: new Date().toISOString().slice(0, 10),
      amount: performer.owesYear,
      transactionRef: `REC-FULL-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod: 'Debt Collection',
      matchStatus: 'Linked',
      targetFeeType: 'All',
      notes: `Full balance debt collection recovery settled`
    };

    onAddPayment(rec);
    setSuccessMessage(language === 'es' 
      ? `🟢 Recuperación total de $${performer.owesYear} registrada para ${performer.name}.`
      : `🟢 Full debt settlement of $${performer.owesYear} recorded for ${performer.name}.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSubmitCustomCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const performer = activePerformers.find(p => p.email === selectedEmail);
    if (!performer || collectionAmount <= 0) return;

    const rec: PaymentRecord = {
      id: `COL-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      email: performer.email,
      payerName: performer.name,
      subject: `Debt Collection Recovery Intake ($${collectionAmount})`,
      from: 'debt.collection@tradicion.org',
      date: new Date().toISOString().slice(0, 10),
      amount: collectionAmount,
      transactionRef: `REC-CUST-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod: 'Debt Collection',
      matchStatus: 'Linked',
      targetFeeType,
      notes: agencyNotes.trim()
    };

    onAddPayment(rec);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setSuccessMessage(language === 'es'
      ? `🟢 Cobro de Deuda por $${collectionAmount} registrado con éxito.`
      : `🟢 Custom Debt Collection payment of $${collectionAmount} successfully logged.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const totalDelinquentBalance = delinquentPerformers.reduce((acc, p) => acc + p.owesYear, 0);
  const totalLateFeesAccrued = delinquentPerformers.reduce((acc, p) => acc + p.totalLateFees, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-3xl w-full border border-slate-200 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-11 h-11 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {language === 'es' ? 'Gestor de Cobro de Deudas y Recargo de Mora' : 'Debt Collection & Fee Settlement Engine'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es'
                ? 'Gestione y aplique recuperaciones de cartera vencida directamente a recargos por mora y cuotas mensuales.'
                : 'Manage overdue delinquent accounts, apply debt collection recoveries, and target late fees or base dues.'}
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block mb-0.5">
              {language === 'es' ? 'Total Deuda Vencida' : 'Total Delinquent Debt'}
            </span>
            <span className="text-lg font-black text-rose-700 font-mono">
              {formatCurrency(totalDelinquentBalance)}
            </span>
            <span className="text-[10px] text-rose-500 block mt-0.5 font-medium">
              {delinquentPerformers.length} {language === 'es' ? 'integrantes en mora' : 'delinquent members'}
            </span>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block mb-0.5">
              {language === 'es' ? 'Cargos por Mora Acumulados' : 'Accrued Late Fees'}
            </span>
            <span className="text-lg font-black text-amber-700 font-mono">
              {formatCurrency(totalLateFeesAccrued)}
            </span>
            <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
              {language === 'es' ? 'Recargos acumulados' : 'Overdue late fee balance'}
            </span>
          </div>

          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block mb-0.5">
              {language === 'es' ? 'Recargo Cobranza Sugerido' : 'Debt Recovery Fee'}
            </span>
            <span className="text-lg font-black text-purple-900 font-mono">
              {formatCurrency(debtCollectionFee)}
            </span>
            <span className="text-[10px] text-purple-600 block mt-0.5 font-medium">
              {language === 'es' ? 'Tarifa fija por gestión' : 'Flat recovery processing fee'}
            </span>
          </div>
        </div>

        {/* Delinquent Performers Quick Action Table */}
        <div className="mb-6">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{language === 'es' ? 'Integrantes en Mora y Acciones Rápidas de Cobranza' : 'Delinquent Accounts & Quick Settlement Actions'}</span>
          </h4>

          {delinquentPerformers.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-slate-700">
                {language === 'es' ? '¡Excelente! No hay integrantes con cartera vencida.' : 'All clear! No delinquent performers currently exist.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">{language === 'es' ? 'Integrante' : 'Performer'}</th>
                    <th className="p-2.5 text-right">{language === 'es' ? 'Cuotas' : 'Dues'}</th>
                    <th className="p-2.5 text-right">{language === 'es' ? 'Recargos Mora' : 'Late Fees'}</th>
                    <th className="p-2.5 text-right">{language === 'es' ? 'Total Deuda' : 'Total Debt'}</th>
                    <th className="p-2.5 text-center">{language === 'es' ? 'Acciones de Cobro' : 'Quick Debt Collection'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {delinquentPerformers.map((p, idx) => {
                    const duesOwed = Math.max(0, p.owesYear - p.totalLateFees);
                    return (
                      <tr key={`debt-row-${p.email}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5">
                          <p className="font-extrabold text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{p.email}</p>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          {formatCurrency(duesOwed)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-amber-600 font-bold">
                          {formatCurrency(p.totalLateFees)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-black text-rose-600">
                          {formatCurrency(p.owesYear)}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.totalLateFees > 0 && (
                              <button
                                onClick={() => handleQuickCollectLateFees(p)}
                                className="px-2 py-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all cursor-pointer"
                                title="Collect late fees only"
                              >
                                {language === 'es' ? 'Cobrar Recargos' : 'Collect Fees ($' + p.totalLateFees + ')'}
                              </button>
                            )}
                            <button
                              onClick={() => handleQuickCollectFullDebt(p)}
                              className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-2xs transition-all cursor-pointer"
                              title="Collect total debt"
                            >
                              {language === 'es' ? 'Cobrar Total' : 'Collect Full ($' + p.owesYear + ')'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Custom Debt Collection Intake Form */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>{language === 'es' ? 'Registro Personalizado de Cobro de Deuda' : 'Custom Debt Collection Payment Intake'}</span>
          </h4>

          <form onSubmit={handleSubmitCustomCollection} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  {language === 'es' ? 'Seleccionar Integrante' : 'Select Performer'}
                </label>
                <select
                  value={selectedEmail}
                  onChange={e => handleSelectPerformer(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {activePerformers.map((p, idx) => (
                    <option key={`debt-opt-${p.email}-${idx}`} value={p.email}>
                      {p.name} ({p.email}) - {p.owesYear > 0 ? `Owes $${p.owesYear}` : 'Clean'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  {language === 'es' ? 'Monto Recaudado ($)' : 'Collected Amount ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={collectionAmount}
                  onChange={e => setCollectionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 text-xs font-mono font-extrabold text-purple-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  {language === 'es' ? 'Destino de Aplicación' : 'Allocation Target'}
                </label>
                <select
                  value={targetFeeType}
                  onChange={e => setTargetFeeType(e.target.value as FeeAllocationTarget)}
                  className="w-full p-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">🔵 Total Deuda (Cuotas + Mora)</option>
                  <option value="Late Fees">🟡 Solo Cargos por Mora (Late Fees Only)</option>
                  <option value="Monthly Dues">🟢 Solo Cuotas Mensuales (Base Dues Only)</option>
                  <option value="Debt Collection Fee">🟣 Recargo de Agencia (Debt Collection Surcharge)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  {language === 'es' ? 'Notas / Referencia de Cobranza' : 'Collection Notes / Ref'}
                </label>
                <input
                  type="text"
                  value={agencyNotes}
                  onChange={e => setAgencyNotes(e.target.value)}
                  placeholder="e.g. Settlement agreement approved by Treasurer"
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Registrar Cobro de Deuda' : 'Record Debt Collection Intake'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
