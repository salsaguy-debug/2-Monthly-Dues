import React, { useState, useEffect } from 'react';
import { PaymentRecord, PaymentMethod, MatchStatus, FeeAllocationTarget } from '../types';
import { sanitizePayerName } from '../utils/payerSanitizer';
import { Plus, X, Sparkles, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (newPayment: PaymentRecord) => void;
  activePerformers: { name: string; email: string }[];
}

const DRAFT_KEY = 'tradicion_draft_add_payment';

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onAddPayment,
  activePerformers
}) => {
  const { language, t } = useLanguage();

  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const draft = getSavedDraft();

  const [email, setEmail] = useState<string>(() => draft?.email || activePerformers[0]?.email || '');
  const [payerName, setPayerName] = useState<string>(() => draft?.payerName || activePerformers[0]?.name || '');
  const [amount, setAmount] = useState<number>(() => draft?.amount !== undefined ? draft.amount : 15.0);
  const [method, setMethod] = useState<PaymentMethod>(() => draft?.method || 'Venmo');
  const [targetFeeType, setTargetFeeType] = useState<FeeAllocationTarget>(() => draft?.targetFeeType || 'All');
  const [subject, setSubject] = useState<string>(() => draft?.subject || 'Dues Payment');
  const [notes, setNotes] = useState<string>(() => draft?.notes || '');
  const [parseEmailText, setParseEmailText] = useState<string>(() => draft?.parseEmailText || '');
  const [isParsing, setIsParsing] = useState(false);

  // Auto-save form draft whenever any field changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        email,
        payerName,
        amount,
        method,
        targetFeeType,
        subject,
        notes,
        parseEmailText
      }));
    } catch (e) {
      console.error(e);
    }
  }, [email, payerName, amount, method, targetFeeType, subject, notes, parseEmailText]);

  if (!isOpen) return null;

  const handlePerformerSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    const matched = activePerformers.find(p => p.email === selectedEmail);
    if (matched) {
      setPayerName(matched.name);
      setSubject(`You received $${amount}.00 from ${matched.name}`);
    }
  };

  const handleSimulateRegexParse = () => {
    if (!parseEmailText.trim()) return;
    setIsParsing(true);

    setTimeout(() => {
      // Simulate Regex Gmail Parser logic from Intake Engine
      const venmoRegex = /received \$([0-9\.]+) from (.+)/i;
      const cashRegex = /(.+) sent you \$([0-9\.]+)/i;

      let extractedAmt = 15.0;
      let extractedName = 'Unknown Payer';
      let extractedMethod: PaymentMethod = 'Venmo';

      const venMatch = parseEmailText.match(venmoRegex);
      if (venMatch) {
        extractedAmt = parseFloat(venMatch[1]);
        extractedName = venMatch[2].trim();
        extractedMethod = 'Venmo';
      } else {
        const cashMatch = parseEmailText.match(cashRegex);
        if (cashMatch) {
          extractedName = cashMatch[1].trim();
          extractedAmt = parseFloat(cashMatch[2]);
          extractedMethod = 'Cash App';
        } else if (parseEmailText.toLowerCase().includes('zelle')) {
          extractedMethod = 'Zelle';
        }
      }

      const cleanExtractedName = sanitizePayerName(extractedName, parseEmailText, '', activePerformers);

      setAmount(extractedAmt);
      setPayerName(cleanExtractedName);
      setMethod(extractedMethod);
      setSubject(parseEmailText.slice(0, 50));

      // Try matching name to roster
      const matched = activePerformers.find(p => p.name.toLowerCase().includes(cleanExtractedName.toLowerCase()));
      if (matched) {
        setEmail(matched.email);
      }

      setIsParsing(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let matchStatus: MatchStatus = 'Linked';
    if (email === 'unknown.payer@gmail.com' || !email) {
      matchStatus = 'Unresolved';
    }

    const cleanName = sanitizePayerName(payerName, subject, email, activePerformers);

    const newRec: PaymentRecord = {
      id: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      email,
      payerName: cleanName,
      subject,
      from: method === 'Venmo' ? 'venmo@venmo.com' : method === 'Cash App' ? 'cash@square.com' : method === 'Debt Collection' ? 'debt.collection@tradicion.org' : 'billing@salsarichmond.com',
      date: new Date().toISOString().slice(0, 10),
      amount,
      transactionRef: `${method === 'Venmo' ? 'VN' : method === 'Cash App' ? 'CA' : method === 'Debt Collection' ? 'COL' : 'SR'}-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: method,
      matchStatus,
      targetFeeType,
      notes
    };

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}

    onAddPayment(newRec);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">
              {language === 'es' ? 'TRANSACCIONES DE INGRESO' : 'INTAKE ENGINE TRANSACTIONS'}
            </span>
            <h3 className="text-base font-extrabold text-slate-800">
              {t('addPaymentTitle')}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regex Simulator Box */}
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 mb-5 space-y-2">
          <label className="block text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {language === 'es' ? 'Analizador Automático de Correo Gmail (Simulador Regex)' : 'Quick Gmail Intake Auto-Parser (Regex Simulation)'}
          </label>
          <input
            type="text"
            placeholder={language === 'es' ? 'Pegar asunto ej: "Recibiste $30.00 de Mateo Silva"' : 'Paste header e.g. "You received $30.00 from Mateo Silva"'}
            value={parseEmailText}
            onChange={e => setParseEmailText(e.target.value)}
            className="w-full p-2 text-xs font-mono bg-white border border-indigo-200 rounded-xl"
          />
          <button
            type="button"
            onClick={handleSimulateRegexParse}
            disabled={isParsing || !parseEmailText.trim()}
            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
          >
            {isParsing ? (language === 'es' ? 'Analizando...' : 'Parsing...') : (language === 'es' ? 'Simular Análisis Regex' : 'Simulate Regex Parse')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              {language === 'es' ? 'Integrante / Bailarín Vinculado' : 'Matched Performer'}
            </label>
            <select
              value={email}
              onChange={e => handlePerformerSelect(e.target.value)}
              className="w-full p-2.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl"
            >
              {activePerformers.map((p, idx) => (
                <option key={`add-pay-perf-${p.email}-${idx}`} value={p.email}>
                  {p.name} ({p.email})
                </option>
              ))}
              <option value="unknown.payer@gmail.com">{language === 'es' ? '-- Pagador Desconocido / No Resuelto --' : '-- Unknown / Unresolved Payer --'}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {language === 'es' ? 'Nombre del Pagador' : 'Payer Name'}
              </label>
              <input
                type="text"
                required
                value={payerName}
                onChange={e => setPayerName(e.target.value)}
                className="w-full p-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {language === 'es' ? 'Monto ($)' : 'Amount ($)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {language === 'es' ? 'Método / Canal de Pago' : 'Payment Channel Method'}
              </label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Venmo">🟣 Venmo</option>
                <option value="Zelle">💚 Zelle</option>
                <option value="Cash App">🟢 Cash App</option>
                <option value="Direct / Salsa Richmond">{language === 'es' ? '🔵 Directo / Salsa Richmond' : '🔵 Direct / Salsa Richmond'}</option>
                <option value="Manual / Cash">{language === 'es' ? '💵 Manual / Efectivo' : '💵 Manual / Cash'}</option>
                <option value="Debt Collection">{language === 'es' ? '⚖️ Agencia de Cobros' : '⚖️ Debt Collection'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {language === 'es' ? 'Destino de Asignación de Cuota' : 'Fee Allocation Target'}
              </label>
              <select
                value={targetFeeType}
                onChange={e => setTargetFeeType(e.target.value as FeeAllocationTarget)}
                className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-purple-900"
              >
                <option value="All">{language === 'es' ? '🔵 Todos (Cuota Base + Recargos por Mora)' : '🔵 All (Base Dues + Late Fees)'}</option>
                <option value="Late Fees">{language === 'es' ? '🟡 Solo Recargos por Mora' : '🟡 Late Fees Only'}</option>
                <option value="Monthly Dues">{language === 'es' ? '🟢 Solo Cuota Base Mensual' : '🟢 Monthly Base Dues Only'}</option>
                <option value="Debt Collection Fee">{language === 'es' ? '🟣 Tarifa de Agencia de Cobros' : '🟣 Debt Collection Agency Fee'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              {language === 'es' ? 'Línea de Asunto' : 'Subject Line'}
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              {language === 'es' ? 'Notas Internas del Libro Mayor' : 'Internal Ledger Notes'}
            </label>
            <input
              type="text"
              placeholder={language === 'es' ? 'ej. Pagado para Cuotas de Abril y Mayo' : 'e.g. Paid for April & May Dues'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              {language === 'es' ? 'Guardar Transacción y Recalcular' : 'Save Transaction & Calculate Balances'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
