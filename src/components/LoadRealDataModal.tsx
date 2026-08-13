import React, { useState, useEffect } from 'react';
import { RawPerformer, PaymentRecord } from '../types';
import { 
  fetchRealDataFromAppsScript, 
  getSavedAppsScriptUrl, 
  saveAppsScriptUrl 
} from '../services/appsScriptService';
import { 
  fetchPerformerPaymentsFromSheet, 
  DEFAULT_PERFORMER_PAYMENTS_SHEET_URL 
} from '../services/googleSheetCsvService';
import { 
  Database, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  CloudDownload, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  CreditCard,
  Code2,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LoadRealDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRealData: (newRoster: RawPerformer[], newPayments: PaymentRecord[]) => void;
  currentRosterCount: number;
  currentPaymentsCount: number;
}

export const LoadRealDataModal: React.FC<LoadRealDataModalProps> = ({
  isOpen,
  onClose,
  onApplyRealData,
  currentRosterCount,
  currentPaymentsCount
}) => {
  const { language } = useLanguage();
  const [syncMode, setSyncMode] = useState<'sheet_csv' | 'apps_script'>('sheet_csv');
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_PERFORMER_PAYMENTS_SHEET_URL);
  const [webAppUrl, setWebAppUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const [previewData, setPreviewData] = useState<{
    roster: RawPerformer[];
    payments: PaymentRecord[];
    summary?: any;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWebAppUrl(getSavedAppsScriptUrl());
      setFetchError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchData = async () => {
    setIsLoading(true);
    setFetchError(null);
    setPreviewData(null);

    if (syncMode === 'sheet_csv') {
      if (!sheetUrl.trim()) {
        setFetchError(language === 'es' ? 'Ingrese la URL del Google Sheet.' : 'Please enter a valid Google Sheet URL.');
        setIsLoading(false);
        return;
      }
      const result = await fetchPerformerPaymentsFromSheet(sheetUrl);
      if (result.success) {
        setPreviewData({
          roster: result.roster,
          payments: result.payments,
          message: result.message
        });
      } else {
        setFetchError(result.message);
      }
    } else {
      if (!webAppUrl.trim()) {
        setFetchError(language === 'es' ? 'Ingrese la URL de la aplicación web de Google Apps Script.' : 'Please enter your Google Apps Script Web App URL.');
        setIsLoading(false);
        return;
      }
      const result = await fetchRealDataFromAppsScript(webAppUrl);
      if (result.success) {
        setPreviewData({
          roster: result.roster,
          payments: result.payments,
          summary: result.summary,
          message: result.message
        });
      } else {
        setFetchError(result.message);
      }
    }

    setIsLoading(false);
  };

  const handleCommitData = () => {
    if (!previewData) return;
    onApplyRealData(previewData.roster, previewData.payments);
    onClose();
  };

  const codeSnippet = `function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getRealData";
  if (action === "getRealData") {
    var settings = readSettingsFromSheet();
    var roster = getMasterRoster();
    var payments = getStoredPaymentsFromSheet();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      timestamp: new Date().toISOString(),
      roster: roster,
      payments: payments,
      settings: settings
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <CloudDownload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                {language === 'es' ? 'UTILIDAD DE CONEXIÓN A DATOS REALES' : 'REAL DATA BACKEND CONNECTOR'}
              </span>
              <h2 className="text-lg font-extrabold text-white">
                {language === 'es' ? 'Cargar Datos Reales desde Google Apps Script' : 'Load Real Data from Google Apps Script'}
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

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Info Card */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2 text-xs text-indigo-950">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{language === 'es' ? 'Bypass de Datos de Muestra Demo' : 'Bypass Mock Data & Sync Real Spreadsheet Data'}</span>
            </div>
            <p className="leading-relaxed text-[11px] text-indigo-800">
              {language === 'es' 
                ? 'Esta utilidad se conecta directamente a la API Web App de su Google Sheet para extraer la nómina real de bailarines (Master_Roster) y el registro real de pagos (Payments) hacia el estado de la aplicación.'
                : 'Connect directly to your Google Apps Script Web App URL to pull live Master_Roster performers and real payment receipts directly into the application state.'}
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setSyncMode('sheet_csv')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                syncMode === 'sheet_csv'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{language === 'es' ? 'Google Sheet CSV (Directo)' : 'Google Sheet CSV (Direct)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSyncMode('apps_script')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                syncMode === 'apps_script'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span>{language === 'es' ? 'Google Apps Script (Web App)' : 'Apps Script Web App'}</span>
            </button>
          </div>

          {/* Sync Mode Specific Inputs */}
          {syncMode === 'sheet_csv' ? (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center justify-between">
                <span>{language === 'es' ? 'URL del Google Sheet (Pestaña "Performer Payments")' : 'Google Sheet URL ("Performer Payments" Tab)'}</span>
                <span className="text-[10px] text-emerald-600 font-bold font-mono">100% Match Accuracy</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1eaEtt.../edit?gid=1439899564"
                  className="flex-1 text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                />
                <button
                  onClick={handleFetchData}
                  disabled={isLoading}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'es' ? 'Cargando...' : 'Loading...'}</span>
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-4 h-4" />
                      <span>{language === 'es' ? 'Importar CSV' : 'Import Sheet Data'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {language === 'es'
                  ? 'Asegúrese de que el enlace tenga la pestaña con permiso "Cualquier persona con el enlace puede ver".'
                  : 'Ensure the spreadsheet tab is set to "Anyone with the link can view".'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center justify-between">
                <span>{language === 'es' ? 'URL de la Aplicación Web (Google Apps Script)' : 'Google Apps Script Web App URL'}</span>
                <span className="text-[10px] text-slate-400 font-normal">doGet Endpoint</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
                />
                <button
                  onClick={handleFetchData}
                  disabled={isLoading}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'es' ? 'Conectando...' : 'Fetching...'}</span>
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-4 h-4" />
                      <span>{language === 'es' ? 'Obtener Datos' : 'Fetch Real Data'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {fetchError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">{language === 'es' ? 'Error al obtener datos' : 'Data Fetch Error'}</span>
                <span className="text-[11px] block">{fetchError}</span>
              </div>
            </div>
          )}

          {/* Fetched Preview Panel */}
          {previewData && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{previewData.message}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">
                    {language === 'es' ? 'Bailarines Reales' : 'Real Performers'}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    {previewData.roster.length}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">
                    {language === 'es' ? 'Pagos Reales' : 'Real Payment Records'}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    {previewData.payments.length}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">
                    {language === 'es' ? 'Ingreso Real Total' : 'Total Revenue'}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block font-mono">
                    ${previewData.payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCommitData}
                className="w-full py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === 'es' 
                    ? `Reemplazar Muestra e Importar ${previewData.roster.length} Bailarines y ${previewData.payments.length} Pagos` 
                    : `Commit Real Data to App State (${previewData.roster.length} Performers, ${previewData.payments.length} Payments)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Setup Code Accordion */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                {language === 'es' ? 'Código doGet para Google Apps Script' : 'Google Apps Script doGet Handler'}
              </span>
              <button
                onClick={handleCopySnippet}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? (language === 'es' ? '¡Copiado!' : 'Copied!') : (language === 'es' ? 'Copiar Código' : 'Copy Handler')}</span>
              </button>
            </div>
            <pre className="text-[10px] font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto max-h-28">
              {codeSnippet}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
