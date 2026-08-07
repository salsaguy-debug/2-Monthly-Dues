import React, { useState } from 'react';
import { RawPerformer, PaymentRecord, PaymentMethod } from '../types';
import { sanitizePayerName } from '../utils/payerSanitizer';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { 
  X, 
  Upload, 
  UserPlus, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Users,
  CreditCard,
  Edit2,
  CloudDownload,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchRealDataFromAppsScript, getSavedAppsScriptUrl } from '../services/appsScriptService';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RawPerformer[];
  onUpdateRoster: (newRoster: RawPerformer[]) => void;
  payments: PaymentRecord[];
  onUpdatePayments: (newPayments: PaymentRecord[]) => void;
  onResetAllData: () => void;
  onClearAllData?: () => void;
  onOpenLoadRealDataModal?: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  roster,
  onUpdateRoster,
  payments,
  onUpdatePayments,
  onResetAllData,
  onClearAllData,
  onOpenLoadRealDataModal
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'roster' | 'payments' | 'import' | 'appsScript'>('roster');

  // Apps Script direct fetch state
  const [gasUrl, setGasUrl] = useState(getSavedAppsScriptUrl());
  const [isFetchingGas, setIsFetchingGas] = useState(false);
  const [gasFetchMessage, setGasFetchMessage] = useState<string | null>(null);
  const [gasFetchError, setGasFetchError] = useState<string | null>(null);

  // Single Performer Form
  const [newPerformerName, setNewPerformerName] = useState('');
  const [newPerformerEmail, setNewPerformerEmail] = useState('');
  const [newPerformerPhone, setNewPerformerPhone] = useState('');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  // CSV Import state
  const [importType, setImportType] = useState<'roster' | 'payments'>('roster');
  const [rawCsvText, setRawCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOrUpdatePerformer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerformerEmail || !newPerformerName) return;

    const emailClean = newPerformerEmail.trim().toLowerCase();

    if (editingEmail) {
      // Update existing
      const updated = roster.map(p => 
        p.email.toLowerCase() === editingEmail.toLowerCase()
          ? { name: newPerformerName.trim(), email: emailClean, phone: newPerformerPhone.trim() }
          : p
      );
      onUpdateRoster(updated);
      setEditingEmail(null);
    } else {
      // Check duplicate
      if (roster.some(p => p.email.toLowerCase() === emailClean)) {
        alert(language === 'es' ? 'Un integrante con este correo ya existe.' : 'A performer with this email already exists.');
        return;
      }
      const updated = [
        ...roster,
        { name: newPerformerName.trim(), email: emailClean, phone: newPerformerPhone.trim() }
      ];
      onUpdateRoster(updated);
    }

    setNewPerformerName('');
    setNewPerformerEmail('');
    setNewPerformerPhone('');
  };

  const handleStartEdit = (p: RawPerformer) => {
    setEditingEmail(p.email);
    setNewPerformerName(p.name);
    setNewPerformerEmail(p.email);
    setNewPerformerPhone(p.phone || '');
  };

  // Confirmation warning modal state flags
  const [deletingPerformerEmail, setDeletingPerformerEmail] = useState<string | null>(null);
  const [isConfirmingClearRoster, setIsConfirmingClearRoster] = useState(false);
  const [isConfirmingClearPayments, setIsConfirmingClearPayments] = useState(false);
  const [isConfirmingClearSample, setIsConfirmingClearSample] = useState(false);

  const handleDeletePerformer = (email: string) => {
    onUpdateRoster(roster.filter(p => p.email.toLowerCase().trim() !== email.toLowerCase().trim()));
    setDeletingPerformerEmail(null);
  };

  const handleClearAllPayments = () => {
    onUpdatePayments([]);
    setIsConfirmingClearPayments(false);
  };

  const handleParseCsv = () => {
    setImportStatus(null);
    setImportError(null);

    if (!rawCsvText.trim()) {
      setImportError(language === 'es' ? 'Por favor pegue texto CSV para importar.' : 'Please paste CSV text to import.');
      return;
    }

    const lines = rawCsvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    if (importType === 'roster') {
      const newPerformers: RawPerformer[] = [];
      let addedCount = 0;

      lines.forEach((line, idx) => {
        // Skip header if line starts with name,email or Name
        if (idx === 0 && line.toLowerCase().includes('email')) return;

        const parts = line.split(',').map(p => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 2) {
          const [nameOrEmail, emailOrName, phone] = parts;
          let name = nameOrEmail;
          let email = emailOrName;

          if (nameOrEmail.includes('@')) {
            email = nameOrEmail;
            name = emailOrName || nameOrEmail.split('@')[0];
          }

          if (email && email.includes('@')) {
            newPerformers.push({
              name: name || email.split('@')[0],
              email: email.toLowerCase(),
              phone: phone || ''
            });
            addedCount++;
          }
        }
      });

      if (addedCount > 0) {
        // Merge with existing roster avoiding duplicates
        const existingEmails = new Set(roster.map(r => r.email.toLowerCase()));
        const filteredNew = newPerformers.filter(p => !existingEmails.has(p.email.toLowerCase()));
        const combined = [...roster, ...filteredNew];
        onUpdateRoster(combined);
        setImportStatus(language === 'es' ? `¡Éxito! Se importaron ${filteredNew.length} integrantes reales.` : `Success! Imported ${filteredNew.length} real performers.`);
        setRawCsvText('');
      } else {
        setImportError(language === 'es' ? 'No se detectaron formatos válidos de correo.' : 'No valid performer rows found in CSV.');
      }
    } else {
      // Payments import
      const newPaymentsList: PaymentRecord[] = [];
      let addedCount = 0;

      lines.forEach((line, idx) => {
        if (idx === 0 && (line.toLowerCase().includes('date') || line.toLowerCase().includes('amount'))) return;

        const parts = line.split(',').map(p => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 3) {
          // Format e.g. Date, Email, Payer, Amount, Channel, Subject
          const date = parts[0] || new Date().toISOString().split('T')[0];
          const email = parts[1]?.includes('@') ? parts[1] : '';
          const rawPayer = parts[2] || parts[1] || 'Payer';
          const subject = parts[5] || `Direct Intake Payment for ${rawPayer}`;
          const amount = extractPaymentAmount(parseFloat(parts[3]), subject, line);
          const methodStr = parts[4] || 'Manual / Cash';
          const cleanPayer = sanitizePayerName(rawPayer, subject, email, roster);

          let paymentMethod: PaymentMethod = 'Manual / Cash';
          if (methodStr.toLowerCase().includes('venmo')) paymentMethod = 'Venmo';
          else if (methodStr.toLowerCase().includes('cash app')) paymentMethod = 'Cash App';
          else if (methodStr.toLowerCase().includes('salsa') || methodStr.toLowerCase().includes('direct')) paymentMethod = 'Direct / Salsa Richmond';

          newPaymentsList.push({
            id: `PAY-REAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            email: email.toLowerCase(),
            payerName: cleanPayer,
            subject,
            from: email ? `${cleanPayer} <${email}>` : cleanPayer,
            date,
            amount,
            transactionRef: `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
            paymentMethod,
            matchStatus: email ? 'Linked' : 'Review Needed'
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        onUpdatePayments([...newPaymentsList, ...payments]);
        setImportStatus(language === 'es' ? `¡Éxito! Se importaron ${addedCount} registros de pagos.` : `Success! Imported ${addedCount} payment records.`);
        setRawCsvText('');
      } else {
        setImportError(language === 'es' ? 'No se encontraron registros de pago válidos.' : 'No valid payment records found.');
      }
    }
  };

  const handleDirectFetchAppsScript = async () => {
    if (!gasUrl.trim()) {
      setGasFetchError(language === 'es' ? 'Ingrese la URL de la aplicación web.' : 'Please enter your Google Apps Script Web App URL.');
      return;
    }

    setIsFetchingGas(true);
    setGasFetchError(null);
    setGasFetchMessage(null);

    const res = await fetchRealDataFromAppsScript(gasUrl);

    if (res.success) {
      if (res.roster.length > 0) onUpdateRoster(res.roster);
      if (res.payments.length > 0) onUpdatePayments(res.payments);
      setGasFetchMessage(res.message);
    } else {
      setGasFetchError(res.message);
    }

    setIsFetchingGas(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                {language === 'es' ? 'GESTOR DE DATOS REALES & CSV' : 'REAL DATA & CSV MANAGER'}
              </span>
              <h2 className="text-lg font-extrabold text-white">
                {language === 'es' ? 'Gestionar Elenco y Cargar Datos Reales' : 'Manage Roster & Load Real Data'}
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

        {/* Sub-Header Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'roster' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'es' ? 'Elenco de Bailarines' : 'Performer Roster'} ({roster.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{language === 'es' ? 'Pagos Reales' : 'Payment Ledger'} ({payments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'import' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'es' ? 'Importar CSV' : 'CSV Upload'}</span>
            </button>
            <button
              onClick={() => setActiveTab('appsScript')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'appsScript' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CloudDownload className="w-4 h-4 text-emerald-300" />
              <span>{language === 'es' ? 'Google Apps Script Backend' : 'Apps Script Backend'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onClearAllData && (
              <button
                onClick={() => setIsConfirmingClearSample(true)}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Wipe out all sample data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Limpiar Todo (Empezar Cero)' : 'Clear Sample Data (Start Fresh)'}</span>
              </button>
            )}

            <button
              onClick={onResetAllData}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 border border-slate-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reload sample demo dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Cargar Muestra Demo' : 'Load Sample Demo Data'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'roster' && (
            <div className="space-y-6">
              {/* Add / Edit Form */}
              <form onSubmit={handleAddOrUpdatePerformer} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    {editingEmail 
                      ? (language === 'es' ? 'Editar Integrante del Elenco' : 'Edit Performer') 
                      : (language === 'es' ? 'Agregar Nuevo Integrante Real' : 'Add New Real Performer')}
                  </h3>
                  {editingEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEmail(null);
                        setNewPerformerName('');
                        setNewPerformerEmail('');
                        setNewPerformerPhone('');
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      {language === 'es' ? 'Cancelar Edición' : 'Cancel Edit'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maria Rodriguez"
                      value={newPerformerName}
                      onChange={e => setNewPerformerName(e.target.value)}
                      required
                      className="w-full p-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      {language === 'es' ? 'Correo Electrónico' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. maria@tradicion.org"
                      value={newPerformerEmail}
                      onChange={e => setNewPerformerEmail(e.target.value)}
                      required
                      className="w-full p-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      {language === 'es' ? 'Teléfono (Opcional)' : 'Phone (Optional)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="(804) 555-0199"
                        value={newPerformerPhone}
                        onChange={e => setNewPerformerPhone(e.target.value)}
                        className="w-full p-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all shrink-0 cursor-pointer"
                      >
                        {editingEmail ? (language === 'es' ? 'Guardar' : 'Save') : (language === 'es' ? 'Agregar' : 'Add')}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Roster List Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">
                    {language === 'es' ? 'Integrantes Registrados' : 'Active Registered Performers'} ({roster.length})
                  </span>
                  {roster.length > 0 && (
                    <button
                      onClick={() => setIsConfirmingClearRoster(true)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{language === 'es' ? 'Limpiar Elenco' : 'Clear Roster'}</span>
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {roster.map((p, idx) => (
                    <div key={`dm-roster-${p.email}-${idx}`} className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3">
                          <span>{p.email}</span>
                          {p.phone && <span>• {p.phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPerformerEmail(p.email)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900">
                    {language === 'es' ? 'Registros de Pago Actuales' : 'Current Payment Records'}
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {language === 'es' 
                      ? `Hay ${payments.length} transacciones registradas. Puede limpiarlas para ingresar únicamente sus pagos reales.`
                      : `There are ${payments.length} transactions recorded. You can clear them to start entering only real payments.`}
                  </p>
                </div>
                <button
                  onClick={() => setIsConfirmingClearPayments(true)}
                  className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Limpiar Todos los Pagos' : 'Clear All Payments'}</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-mono uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Payer</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p, idx) => (
                      <tr key={`dm-pay-${p.id || idx}-${idx}`} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-[11px]">{p.date}</td>
                        <td className="p-3 font-bold">{sanitizePayerName(p.payerName, p.subject, p.email, roster)}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{p.email || '—'}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">${extractPaymentAmount(p.amount, p.subject, p.notes).toFixed(2)}</td>
                        <td className="p-3 text-[11px]">{p.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setImportType('roster')}
                  className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    importType === 'roster'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'es' ? 'Importar Elenco de Integrantes' : 'Import Performer Roster CSV'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportType('payments')}
                  className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    importType === 'payments'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'es' ? 'Importar Registros de Pagos' : 'Import Payments CSV'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {importType === 'roster'
                    ? (language === 'es' ? 'Pegar filas CSV (Nombre, Correo, Teléfono):' : 'Paste CSV rows (Name, Email, Phone):')
                    : (language === 'es' ? 'Pegar filas CSV (Fecha, Correo, Pagador, Monto, Canal):' : 'Paste CSV rows (Date, Email, Payer, Amount, Channel):')}
                </label>
                <textarea
                  rows={6}
                  placeholder={
                    importType === 'roster'
                      ? 'Maria Rodriguez, maria@tradicion.org, (804) 555-0199\nCarlos Sanchez, carlos@tradicion.org'
                      : '2026-05-10, maria@tradicion.org, Maria Rodriguez, 30.00, Venmo'
                  }
                  value={rawCsvText}
                  onChange={e => setRawCsvText(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {importStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleParseCsv}
                className="w-full py-3 bg-indigo-600 text-white font-extrabold text-xs rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{language === 'es' ? 'Procesar e Importar CSV' : 'Process & Import CSV Data'}</span>
              </button>
            </div>
          )}

          {activeTab === 'appsScript' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'es' ? 'Conexión Directa a Google Apps Script Web App' : 'Direct Google Apps Script Web App Backend Connection'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  {language === 'es'
                    ? 'Conecte la URL de su Google Apps Script para importar la nómina real de bailarines (Master_Roster) y el registro real de pagos desde Google Sheets al estado de la app.'
                    : 'Enter your deployed Google Apps Script Web App URL to pull live Master_Roster performers and actual payment receipts directly into the application state.'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-800">
                  {language === 'es' ? 'URL de la Aplicación Web (Google Apps Script)' : 'Google Apps Script Web App URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDirectFetchAppsScript}
                    disabled={isFetchingGas}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isFetchingGas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'es' ? 'Cargando...' : 'Fetching...'}</span>
                      </>
                    ) : (
                      <>
                        <CloudDownload className="w-4 h-4" />
                        <span>{language === 'es' ? 'Cargar Datos Reales' : 'Load Real Data'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {gasFetchMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{gasFetchMessage}</span>
                </div>
              )}

              {gasFetchError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">{language === 'es' ? 'Error al Cargar Datos' : 'Failed to Load Real Data'}</span>
                    <span className="text-[11px] block">{gasFetchError}</span>
                  </div>
                </div>
              )}

              {onOpenLoadRealDataModal && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLoadRealDataModal();
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {language === 'es' ? 'Abrir Asistente Avanzado de Conexión a Datos Reales →' : 'Open Full Load Real Data Guided Wizard →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Single Performer Warning Confirmation Modal */}
      {deletingPerformerEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl relative space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'es' ? '⚠️ Confirmar Eliminación' : '⚠️ Confirm Deletion'}
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  {language === 'es' ? 'Eliminar integrante del elenco' : 'Remove performer from roster'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
              {language === 'es'
                ? `¿Está seguro de que desea eliminar a ${deletingPerformerEmail}?`
                : `Are you sure you want to remove ${deletingPerformerEmail} from the roster?`}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingPerformerEmail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDeletePerformer(deletingPerformerEmail)}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Eliminar' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Entire Roster Warning Confirmation Modal */}
      {isConfirmingClearRoster && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl relative space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'es' ? '⚠️ Confirmar Limpieza de Elenco' : '⚠️ Confirm Roster Clear'}
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  {language === 'es' ? 'Acción de eliminación masiva' : 'Mass deletion action'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
              {language === 'es'
                ? `¿Está seguro de que desea eliminar TODO el elenco de integrantes (${roster.length} integrantes)?`
                : `Are you sure you want to clear the entire performer roster (${roster.length} active performers)?`}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmingClearRoster(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onUpdateRoster([]);
                  setIsConfirmingClearRoster(false);
                }}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Limpiar Elenco' : 'Yes, Clear Roster'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Payments Warning Confirmation Modal */}
      {isConfirmingClearPayments && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl relative space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'es' ? '⚠️ Confirmar Limpieza de Pagos' : '⚠️ Confirm Payments Purge'}
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  {language === 'es' ? 'Eliminar historial de transacciones' : 'Purge transaction history'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
              {language === 'es'
                ? `¿Está seguro de que desea eliminar TODOS los registros de pagos (${payments.length} transacciones)?`
                : `Are you sure you want to clear all payment records (${payments.length} recorded transactions)?`}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmingClearPayments(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleClearAllPayments}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Limpiar Pagos' : 'Yes, Clear Payments'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Sample Data Start Fresh Warning Confirmation Modal */}
      {isConfirmingClearSample && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl relative space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'es' ? '⚠️ Confirmar Limpieza de Datos de Muestra' : '⚠️ Confirm Purge Sample Data'}
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  {language === 'es' ? 'Eliminar todos los datos para empezar de cero' : 'Purge all sample data to start fresh'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
              {language === 'es'
                ? '¿Está seguro de que desea eliminar TODOS los datos de muestra (elenco y pagos) para empezar con su información real?'
                : 'Are you sure you want to clear ALL sample roster and payment data to start fresh with your real system data?'}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmingClearSample(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setIsConfirmingClearSample(false);
                  if (onClearAllData) onClearAllData();
                }}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Sí, Limpiar Todo' : 'Yes, Start Fresh'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
