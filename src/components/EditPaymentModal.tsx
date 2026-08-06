import React, { useState, useEffect } from 'react';
import { X, Receipt, Trash2, Save, DollarSign, Calendar, Tag, Mail, User, AlertTriangle } from 'lucide-react';
import { PaymentRecord, PaymentMethod, MatchStatus, FeeAllocationTarget } from '../types';
import { sanitizePayerName } from '../utils/payerSanitizer';
import { useLanguage } from '../context/LanguageContext';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  activePerformersEmails: string[];
  onSave: (updated: PaymentRecord) => void;
  onDelete?: (id: string) => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  activePerformersEmails,
  onSave,
  onDelete
}) => {
  const { language } = useLanguage();
  const [payerName, setPayerName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState<number>(15);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Venmo');
  const [targetFeeType, setTargetFeeType] = useState<FeeAllocationTarget>('All');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('Linked');
  const [transactionRef, setTransactionRef] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (payment) {
      setPayerName(payment.payerName || '');
      setEmail(payment.email || '');
      setAmount(payment.amount || 0);
      setPaymentMethod(payment.paymentMethod || 'Venmo');
      setTargetFeeType(payment.targetFeeType || 'All');
      setMatchStatus(payment.matchStatus || 'Linked');
      setTransactionRef(payment.transactionRef || '');
      setDate(payment.date || new Date().toISOString().slice(0, 10));
      setNotes(payment.notes || '');
      setIsConfirmingDelete(false);
    }
  }, [payment]);

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || amount <= 0) return;

    onSave({
      ...payment,
      payerName: sanitizePayerName(payerName.trim(), payment.subject, email.trim()),
      email: email.trim().toLowerCase(),
      amount: Number(amount),
      paymentMethod,
      targetFeeType,
      matchStatus,
      transactionRef: transactionRef.trim() || `REF-${Date.now()}`,
      date: date || new Date().toISOString().slice(0, 10),
      notes: notes.trim()
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    if (onDelete && payment) {
      onDelete(payment.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              {language === 'es' ? 'Editar / Corregir Registro de Pago' : 'Edit / Correct Payment Record'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es' ? 'Ajuste el monto, pagador, canal de pago o estado.' : 'Adjust amount, assigned email, payment channel, or date.'}
            </p>
          </div>
        </div>

        {isConfirmingDelete ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {language === 'es'
                  ? `¿Confirmar eliminación de pago de $${payment.amount}?`
                  : `Confirm deletion of $${payment.amount} payment?`}
              </span>
            </div>
            <p className="text-[11px] text-rose-700">
              {language === 'es'
                ? 'Esta acción eliminará el registro de pago del sistema de contabilidad.'
                : 'This will remove the payment record from accounting balances.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Eliminar' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'es' ? 'Nombre Pagador' : 'Payer Name'}
              </label>
              <input
                type="text"
                required
                value={payerName}
                onChange={e => setPayerName(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'es' ? 'Correo Asignado' : 'Assigned Performer Email'}
              </label>
              <input
                type="text"
                list="performers-email-list"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <datalist id="performers-email-list">
                {activePerformersEmails.map((e, idx) => (
                  <option key={`edit-pay-opt-${e}-${idx}`} value={e} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'es' ? 'Monto ($ USD)' : 'Amount ($ USD)'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 text-xs font-mono font-extrabold text-emerald-600 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'es' ? 'Canal de Pago' : 'Payment Channel'}
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              >
                <option value="Venmo">🟣 Venmo</option>
                <option value="Zelle">💚 Zelle</option>
                <option value="Cash App">🟢 Cash App</option>
                <option value="Direct / Salsa Richmond">🔵 Direct / Salsa Richmond</option>
                <option value="Manual / Cash">💵 Manual / Cash</option>
                <option value="Debt Collection">⚖️ Debt Collection</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              {language === 'es' ? 'Destino de Aplicación' : 'Fee Allocation Target'}
            </label>
            <select
              value={targetFeeType}
              onChange={e => setTargetFeeType(e.target.value as FeeAllocationTarget)}
              className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-purple-900 focus:outline-hidden"
            >
              <option value="All">🔵 Total Deuda (Base Dues + Late Fees)</option>
              <option value="Late Fees">🟡 Solo Cargos por Mora (Late Fees Only)</option>
              <option value="Monthly Dues">🟢 Solo Cuotas Mensuales (Base Dues Only)</option>
              <option value="Debt Collection Fee">🟣 Recargo de Cobranza (Agency Fee)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'es' ? 'Fecha de Transacción' : 'Transaction Date'}
              </label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                {language === 'es' ? 'Estado de Coincidencia' : 'Match Status'}
              </label>
              <select
                value={matchStatus}
                onChange={e => setMatchStatus(e.target.value as MatchStatus)}
                className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              >
                <option value="Linked">🟢 Linked (Asociado)</option>
                <option value="Review Needed">🟡 Review Needed (Revisión)</option>
                <option value="Unresolved">🔴 Unresolved (Sin resolver)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Ref # / ID
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              {language === 'es' ? 'Notas / Comentarios' : 'Notes / Remarks'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Corrected manually after verification"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
            {onDelete && !isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3.5 py-2 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Eliminar' : 'Delete'}</span>
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Guardar Cambios' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
