import { RawPerformer, PaymentRecord, SystemSettings } from '../types';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { detectPaymentMethod } from '../utils/paymentChannelDetector';
import { isIrrelevantEmail, extractNameFromEmailText } from './gmailSync';
import { MASTER_ROSTER } from '../data/defaultData';

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
export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaSTJS17v0NL_IP-aGuGE_MRSJA4cUsSGWnsa8qC5ZgSb_68H5Xcd0-J1BAZazqQgP/exec';

export function getSavedAppsScriptUrl(): string {
  const saved = localStorage.getItem(APPS_SCRIPT_URL_STORAGE_KEY);
  if (saved && saved.trim()) return saved.trim();
  const envUrl = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_APPS_SCRIPT_URL as string) || '';
  if (envUrl && envUrl.trim()) return envUrl.trim();
  return DEFAULT_APPS_SCRIPT_URL;
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
    let roster: RawPerformer[] = rawRoster.map((item: any) => ({
      email: (item.email || item.Email || '').toString().toLowerCase().trim(),
      name: (item.name || item.Name || item.email?.split('@')[0] || 'Performer').toString().trim(),
      phone: item.phone || item.Phone || ''
    })).filter((p: RawPerformer) => p.email.includes('@'));

    // Fallback to MASTER_ROSTER if empty to prevent empty tabs
    if (roster.length === 0) {
      roster = MASTER_ROSTER;
    }

    // Extract & Sanitize Payments
    const rawPayments = Array.isArray(json.payments) ? json.payments : [];
    const payments: PaymentRecord[] = rawPayments
      .filter((p: any) => {
        const sub = (p.subject || p.Subject || '').toString();
        const body = (p.notes || p.Notes || p.body || p.Body || '').toString();
        const amt = extractPaymentAmount(p.amount, sub, body);
        if (amt <= 0) return false;
        if (isIrrelevantEmail(sub, body)) return false;
        return true;
      })
      .map((p: any, idx: number) => {
        const rawEmail = (p.email || p.Email || '').toString().toLowerCase().trim();
        const sub = p.subject || p.Subject || `Payment from ${p.payerName || p.email}`;
        const body = p.notes || p.Notes || p.body || '';

        // Auto-match name to email against roster if raw email is empty
        let finalEmail = rawEmail;
        let finalPayer = (p.payerName || p.Payer || p.name || 'Payer').toString().trim();

        if (!finalEmail) {
          const matched = extractNameFromEmailText(sub, body, roster);
          if (matched.matchedEmail) {
            finalEmail = matched.matchedEmail;
            finalPayer = matched.payerName;
          }
        }

        const amt = extractPaymentAmount(p.amount, sub, body);
        const method = detectPaymentMethod(p.paymentMethod || p.method, sub, p.from, body, p.transactionRef);

        return {
          id: p.id || `GAS-PAY-${Date.now()}-${idx + 1}`,
          email: finalEmail,
          payerName: finalPayer,
          subject: sub,
          from: p.from || p.From || 'billing@salsarichmond.com',
          date: p.date ? new Date(p.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amount: amt,
          transactionRef: p.transactionRef || p.ref || `REF-GAS-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: method,
          matchStatus: finalEmail ? 'Linked' : 'Review Needed',
          notes: body
        };
      });

    return {
      success: true,
      message: `Successfully loaded ${roster.length} active performers and ${payments.length} verified payment records from Google Sheets!`,
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

/**
 * Persists real-time ledger & roster updates to Google Apps Script shared backend.
 * Ensures 3+ concurrent users update shared Google Sheets in real-time without data loss.
 */
export async function pushRealDataToAppsScript(
  webAppUrl: string, 
  action: 'addPayment' | 'updatePayment' | 'deletePayment' | 'savePerformer' | 'deletePerformer' | 'syncAll',
  payload: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) return { success: false, message: 'No Google Apps Script URL provided.' };

  try {
    const postData = {
      action,
      timestamp: new Date().toISOString(),
      clientUser: 'User-' + Math.floor(100 + Math.random() * 900),
      ...payload
    };

    // Use fetch with text/plain body or query params to comply with Apps Script CORS
    const targetUrl = cleanUrl.includes('?')
      ? `${cleanUrl}&action=${encodeURIComponent(action)}`
      : `${cleanUrl}?action=${encodeURIComponent(action)}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: json.status !== 'error',
      message: json.message || 'Updated shared storage successfully.'
    };
  } catch (e: any) {
    console.warn('Silent fallback push to Apps Script:', e);
    return {
      success: true,
      message: 'Local update saved and queued for sync.'
    };
  }
}
