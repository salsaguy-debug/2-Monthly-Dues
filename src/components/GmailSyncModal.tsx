import React, { useState, useEffect } from 'react';
import { RawPerformer, PaymentRecord } from '../types';
import { sanitizePayerName } from '../utils/payerSanitizer';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { googleSignIn, getAccessToken, initAuth, logoutUser } from '../lib/firebase';
import { triggerTrackVenmoPayments, executeDryRunImport, parseRawEmailToPaymentRecord } from '../utils/gmailConnector';
import { 
  X, 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Search,
  FlaskConical,
  ClipboardList
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { User } from 'firebase/auth';

interface GmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RawPerformer[];
  payments: PaymentRecord[];
  onAddSyncedPayments: (newPayments: PaymentRecord[]) => void;
  onViewPaymentRecords?: () => void;
  onClearAllData?: () => void;
}

const DRAFT_KEY = 'tradicion_draft_gmail_sync';

export const GmailSyncModal: React.FC<GmailSyncModalProps> = ({
  isOpen,
  onClose,
  roster,
  payments,
  onAddSyncedPayments,
  onViewPaymentRecords,
  onClearAllData
}) => {
  const { language } = useLanguage();

  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const draft = getSavedDraft();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState<string>(() => draft?.customQuery || '(from:venmo@venmo.com OR from:cash@square.com OR from:salsaguy@salsarichmond.com OR Venmo OR "Cash App" OR "Salsa Richmond")');
  const [rawText, setRawText] = useState<string>(() => draft?.rawText || '');
  const [activeTab, setActiveTab] = useState<'oauth' | 'paste' | 'dryrun'>(() => draft?.activeTab || 'oauth');
  const [syncResult, setSyncResult] = useState<{
    syncedCount: number;
    newPayments: PaymentRecord[];
    message?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-save draft on state change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        customQuery,
        rawText,
        activeTab
      }));
    } catch (e) {
      console.error(e);
    }
  }, [customQuery, rawText, activeTab]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignInAndSync = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSyncResult(null);

    try {
      let token = await getAccessToken();
      let user = currentUser;

      if (!token || !user) {
        const result = await googleSignIn();
        if (result) {
          token = result.accessToken;
          setCurrentUser(result.user);
        }
      }

      if (!token) {
        throw new Error('Google OAuth access token missing.');
      }

      // Execute automated Gmail extraction via triggerTrackVenmoPayments service layer
      const response = await triggerTrackVenmoPayments({
        accessToken: token,
        roster,
        existingPayments: payments,
        customQuery
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      if (response.syncedCount > 0) {
        onAddSyncedPayments(response.newPayments);
      }

      setSyncResult({
        syncedCount: response.syncedCount,
        newPayments: response.newPayments,
        message: response.syncedCount > 0 
          ? (language === 'es' ? `¡Se recolectaron ${response.syncedCount} pagos nuevos desde Gmail!` : `Gathered ${response.syncedCount} new payments from Gmail!`)
          : (language === 'es' ? 'No se encontraron pagos nuevos en la bandeja de entrada con los criterios especificados.' : 'No new payment emails found in inbox for specified query.')
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === 'es' ? 'Error al sincronizar con Gmail' : 'Error syncing with Gmail'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseRawText = () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSyncResult(null);

    try {
      const record = parseRawEmailToPaymentRecord(
        'Manual Pasted Notification',
        rawText,
        'manual@import.com',
        `PASTE-${Date.now()}`,
        Date.now().toString(),
        roster
      );

      onAddSyncedPayments([record]);

      setSyncResult({
        syncedCount: 1,
        newPayments: [record],
        message: language === 'es' ? '¡Texto procesado y vinculado con éxito!' : 'Successfully parsed and linked payment text!'
      });
      setRawText('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to parse text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setSyncResult(null);
  };

  const handleDryRunImport = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSyncResult(null);

    setTimeout(() => {
      const response = executeDryRunImport(roster, payments);
      if (response.syncedCount > 0) {
        onAddSyncedPayments(response.newPayments);
      }
      setSyncResult({
        syncedCount: response.syncedCount,
        newPayments: response.newPayments,
        message: response.message
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {language === 'es' ? 'RECOLECCIÓN AUTOMÁTICA GMAIL' : 'AUTOMATED GMAIL INTAKE ENGINE'}
              </span>
              <h2 className="text-lg font-extrabold text-white">
                {language === 'es' ? 'Extraer Pagos de Venmo, Cash App y Salsa Richmond' : 'Extract Payments from Venmo, Cash App & Salsa Richmond'}
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100 p-2 gap-2">
          <button
            onClick={() => setActiveTab('oauth')}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'oauth'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-600" />
            <span>{language === 'es' ? '1. Gmail Live' : '1. Gmail Live'}</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'paste'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            <span>{language === 'es' ? '2. Pegar Texto' : '2. Paste Email Text'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dryrun')}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'dryrun'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-amber-600" />
            <span>{language === 'es' ? '3. Prueba / Dry Run' : '3. Dry Run Test'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              {/* Search Query Customizer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <label className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-indigo-600" />
                    {language === 'es' ? 'Consulta de Búsqueda de Gmail' : 'Gmail Search Query'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'es' ? 'Personalizable' : 'Editable'}
                  </span>
                </label>
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. from:venmo@venmo.com OR Venmo OR paid you"
                />

                {/* Query Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setCustomQuery('Venmo OR "Cash App" OR Zelle OR PayPal OR Salsa OR payment OR paid OR received OR "$"' )}
                    className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 cursor-pointer transition-all"
                  >
                    All Payment Emails
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomQuery('(from:venmo@venmo.com OR from:cash@square.com OR Venmo OR "Cash App")')}
                    className="text-[10px] font-bold px-2.5 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg cursor-pointer transition-all"
                  >
                    Venmo & Cash App
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomQuery('subject:(payment OR paid OR venmo OR cash OR salsa)')}
                    className="text-[10px] font-bold px-2.5 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg cursor-pointer transition-all"
                  >
                    Subject Contains Payment
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  {language === 'es' 
                    ? 'Especifique términos de búsqueda en su correo (sin restricciones de fecha).' 
                    : 'Search terms used to locate Venmo, Cash App, and Salsa Richmond emails.'}
                </p>
              </div>

              {/* Clear Test Data Action Banner if sample payments exist */}
              {payments.length > 0 && onClearAllData && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block">
                      {language === 'es' ? 'Actualmente hay datos de prueba cargados' : 'Sample/Test Data Active'}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {language === 'es' ? `Hay ${payments.length} registros en el sistema.` : `Currently holding ${payments.length} payment records in local memory.`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClearAllData) onClearAllData();
                      setSyncResult(null);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {language === 'es' ? 'Limpiar Datos' : 'Clear Data'}
                  </button>
                </div>
              )}

              {/* User Auth Status */}
              {currentUser ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        {language === 'es' ? 'Sesión Iniciada en Google' : 'Signed in with Google'}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-mono">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2 text-center">
                  <p className="text-xs text-indigo-900 font-semibold">
                    {language === 'es' 
                      ? 'Conecte su cuenta de Google para buscar automáticamente correos de confirmación de pago.' 
                      : 'Connect your Google account to automatically scan your inbox for payment confirmation emails.'}
                  </p>
                </div>
              )}

              <button
                onClick={handleSignInAndSync}
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>{language === 'es' ? 'Escaneando Gmail...' : 'Scanning Gmail Inbox...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>
                      {currentUser 
                        ? (language === 'es' ? 'Sincronizar y Extraer Correos Ahora' : 'Sync & Extract Gmail Payments Now')
                        : (language === 'es' ? 'Iniciar Sesión con Google y Extraer Pagos' : 'Sign in with Google & Sync Payments')}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTab('paste')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer inline-flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>
                    {language === 'es'
                      ? '¿Prefiere pegar el texto de una notificación manualmente? Haga clic aquí'
                      : 'Or paste an email notification text manually (Tab 2)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'es' ? 'Pegar Texto del Correo / Notificación' : 'Paste Email Notification Text'}
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setRawText(`${roster[0]?.name || 'Elena Rostova'} paid you $15.00 via Venmo for dues`)}
                      className="px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
                    >
                      + Venmo Sample
                    </button>
                    <button
                      onClick={() => setRawText(`Cash App: ${roster[1]?.name || 'Marcus Chen'} sent you $15.00`)}
                      className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer"
                    >
                      + Cash App Sample
                    </button>
                  </div>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  placeholder={language === 'es' 
                    ? 'Ejemplo: "Elena Rostova paid you $15.00 for July Dues"'
                    : 'Example: "Elena Rostova paid you $15.00 for July Dues"'}
                />
              </div>

              <button
                onClick={handleParseRawText}
                disabled={!rawText.trim() || isLoading}
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ClipboardList className="w-4 h-4" />
                <span>{language === 'es' ? 'Procesar e Importar Texto' : 'Parse & Import Pasted Text'}</span>
              </button>
            </div>
          )}

          {activeTab === 'dryrun' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-2">
                <p className="font-bold">
                  {language === 'es' ? 'Simulador de Importación (Prueba)' : 'Simulated Gmail Extraction (Dry Run)'}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {language === 'es'
                    ? 'Genera notificaciones de pago simuladas desde Venmo, Cash App y Salsa Richmond, realiza la vinculación de nombres con la nómina activa e importa los registros inmediatamente al panel principal.'
                    : 'Generates sample Venmo, Cash App, and Salsa Richmond payment notifications, performs automatic roster name matching, and commits records instantly to your dashboard.'}
                </p>
              </div>

              <button
                onClick={handleDryRunImport}
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FlaskConical className="w-4 h-4" />
                <span>
                  {language === 'es' 
                    ? 'Ejecutar Importación de Prueba (Dry Run)' 
                    : 'Execute Dry Run Import'}
                </span>
              </button>
            </div>
          )}

          {/* Sync Results Display */}
          {syncResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncResult.message}</span>
              </div>

              {syncResult.newPayments.length > 0 && (
                <>
                  <div className="max-h-40 overflow-y-auto divide-y divide-emerald-100 border border-emerald-200 rounded-xl bg-white">
                    {syncResult.newPayments.map((p, idx) => (
                      <div key={`gmail-sync-${p.id || idx}-${idx}`} className="p-2.5 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{sanitizePayerName(p.payerName, p.subject, p.email, roster)}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{p.subject}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-600">${extractPaymentAmount(p.amount, p.subject, p.notes).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 block">{p.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onViewPaymentRecords) onViewPaymentRecords();
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{language === 'es' ? 'Ver Registros de Pago Importados en la Tabla →' : 'View Imported Payment Records in Table →'}</span>
                  </button>
                </>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
