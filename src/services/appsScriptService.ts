import { RawPerformer, PaymentRecord, SystemSettings } from '../types';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { detectPaymentMethod } from '../utils/paymentChannelDetector';

export interface AppsScriptFetchResult {
  success: boolean;
  message: string;
  roster: RawPerformer[];
  payments: PaymentRecord[];
  settings?: Partial<SystemSettings>;
  timestamp?: string;
  summary?: {
    totalRevenue: number;
    totalOutstanding: number;
    totalLateFees: number;
    collectionRate: string;
  };
}

const APPS_SCRIPT_URL_STORAGE_KEY = 'tradicion_apps_script_url';

export function getSavedAppsScriptUrl(): string {
  const saved = localStorage.getItem(APPS_SCRIPT_URL_STORAGE_KEY);
  if (saved && saved.trim()) return saved.trim();
  const envUrl = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_APPS_SCRIPT_URL as string) || '';
  return envUrl.trim();
}

export function saveAppsScriptUrl(url: string): void {
  localStorage.setItem(APPS_SCRIPT_URL_STORAGE_KEY, url.trim());
}

/**
 * Utility to fetch real ledger data from Google Apps Script Web App backend.
 * Bypasses local mock data and retrieves live Master_Roster & Payments from Google Sheets.
 */
export async function fetchRealDataFromAppsScript(webAppUrl: string): Promise<AppsScriptFetchResult> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) {
    return {
      success: false,
      message: 'Please provide a valid Google Apps Script Web App URL.',
      roster: [],
      payments: []
    };
  }

  saveAppsScriptUrl(cleanUrl);

  // Construct GET endpoint with action parameter
  const targetUrl = cleanUrl.includes('?')
    ? `${cleanUrl}&action=getRealData`
    : `${cleanUrl}?action=getRealData`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.status === 'error') {
      return {
        success: false,
        message: json.message || 'Google Apps Script backend returned an error.',
        roster: [],
        payments: []
      };
    }

    // Extract Roster
    const rawRoster = Array.isArray(json.roster) ? json.roster : [];
    const roster: RawPerformer[] = rawRoster.map((item: any) => ({
      email: (item.email || item.Email || '').toString().toLowerCase().trim(),
      name: (item.name || item.Name || item.email?.split('@')[0] || 'Performer').toString().trim(),
      phone: item.phone || item.Phone || ''
    })).filter((p: RawPerformer) => p.email.includes('@'));

    // Extract Payments
    const rawPayments = Array.isArray(json.payments) ? json.payments : [];
    const payments: PaymentRecord[] = rawPayments.map((p: any, idx: number) => ({
      id: p.id || `GAS-PAY-${Date.now()}-${idx + 1}`,
      email: (p.email || p.Email || '').toString().toLowerCase().trim(),
      payerName: (p.payerName || p.Payer || p.name || 'Payer').toString().trim(),
      subject: p.subject || p.Subject || `Payment from ${p.payerName || p.email}`,
      from: p.from || p.From || 'billing@salsarichmond.com',
      date: p.date ? new Date(p.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      amount: extractPaymentAmount(p.amount, p.subject || p.Subject, p.notes || p.Notes, p.body || p.Body),
      transactionRef: p.transactionRef || p.ref || `REF-GAS-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: detectPaymentMethod(p.paymentMethod || p.method, p.subject || p.Subject, p.from || p.From, p.notes || p.Notes, p.transactionRef || p.ref),
      matchStatus: p.matchStatus || (p.email ? 'Linked' : 'Unresolved'),
      notes: p.notes || p.Notes || ''
    }));

    return {
      success: true,
      message: `Successfully loaded ${roster.length} real performers and ${payments.length} payment records from Google Sheets!`,
      roster,
      payments,
      settings: json.settings,
      timestamp: json.timestamp || new Date().toISOString(),
      summary: json.summary
    };
  } catch (error: any) {
    console.error('Apps Script Fetch Error:', error);
    return {
      success: false,
      message: `Failed to fetch from Google Apps Script Web App: ${error.message || 'Network error or CORS policy constraint'}. Make sure the script is deployed as a Web App with access set to "Anyone".`,
      roster: [],
      payments: []
    };
  }
}
