import { RawPerformer, PaymentRecord } from '../types';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { detectPaymentMethod } from '../utils/paymentChannelDetector';
import { isIrrelevantEmail, extractNameFromEmailText } from './gmailSync';
import { MASTER_ROSTER } from '../data/defaultData';

export const DEFAULT_PERFORMER_PAYMENTS_SHEET_URL = 
  'https://docs.google.com/spreadsheets/d/1eaEttUh8JZPyoY61HLHpf5UxhgEltK9oU5bwUNyDwwU/edit?gid=1439899564#gid=1439899564';

export const DEFAULT_PERFORMER_PAYMENTS_GVIZ_URL = 
  'https://docs.google.com/spreadsheets/d/1eaEttUh8JZPyoY61HLHpf5UxhgEltK9oU5bwUNyDwwU/gviz/tq?tqx=out:csv&gid=1439899564';

export interface GoogleSheetCsvFetchResult {
  success: boolean;
  message: string;
  roster: RawPerformer[];
  payments: PaymentRecord[];
  timestamp: string;
}

/**
 * Extracts Google Sheet ID and GID parameter from standard Google Sheet URLs
 */
export function convertSheetUrlToGvizUrl(url: string): string {
  const cleanUrl = url.trim();
  const sheetIdMatch = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) return cleanUrl;

  const sheetId = sheetIdMatch[1];
  const gidMatch = cleanUrl.match(/[?&#]gid=([0-9]+)/);
  const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
}

/**
 * Simple CSV line parser handling quoted fields and escaped commas
 */
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Fetches and parses live Performer Payments tab directly from Google Sheet CSV
 */
export async function fetchPerformerPaymentsFromSheet(sheetUrl: string): Promise<GoogleSheetCsvFetchResult> {
  const gvizUrl = convertSheetUrlToGvizUrl(sheetUrl);

  try {
    const response = await fetch(gvizUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      return {
        success: false,
        message: 'Google Sheet tab appears to be empty or contains header row only.',
        roster: MASTER_ROSTER,
        payments: [],
        timestamp: new Date().toISOString()
      };
    }

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Find column indexes
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const nameIdx = headers.findIndex(h => h.includes('performer') || h.includes('name') || h.includes('payer'));
    const channelIdx = headers.findIndex(h => h.includes('channel') || h.includes('method') || h.includes('type'));
    const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('paid') || h.includes('fee'));
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const refIdx = headers.findIndex(h => h.includes('ref') || h.includes('note') || h.includes('transaction'));

    const rosterMap = new Map<string, RawPerformer>();
    MASTER_ROSTER.forEach(p => rosterMap.set(p.email.toLowerCase(), p));

    const payments: PaymentRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length === 0) continue;

      let email = (emailIdx >= 0 && cols[emailIdx] ? cols[emailIdx] : '').toLowerCase().trim();
      let name = (nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : '').trim();
      const rawChannel = channelIdx >= 0 && cols[channelIdx] ? cols[channelIdx] : 'Venmo';
      const rawAmount = amountIdx >= 0 && cols[amountIdx] ? cols[amountIdx] : '0';
      const rawDate = dateIdx >= 0 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0];
      const rawNotes = refIdx >= 0 && cols[refIdx] ? cols[refIdx] : '';

      // Skip non-payment or marketing / security alert rows
      if (isIrrelevantEmail(name + ' ' + rawNotes, rawNotes)) continue;

      const amount = extractPaymentAmount(rawAmount, rawNotes, rawNotes, rawNotes);
      if (amount <= 0) continue;

      const activeRosterArray = Array.from(rosterMap.values());
      if (!email) {
        const matched = extractNameFromEmailText(name || rawNotes, rawNotes, activeRosterArray);
        if (matched.matchedEmail) {
          email = matched.matchedEmail;
          name = matched.payerName;
        }
      }

      if (email && email.includes('@')) {
        if (!rosterMap.has(email)) {
          rosterMap.set(email, {
            email,
            name: name || email.split('@')[0],
            phone: ''
          });
        }

        const method = detectPaymentMethod(rawChannel, rawNotes, email, rawNotes, rawNotes);
        const formattedDate = rawDate && !isNaN(Date.parse(rawDate)) 
          ? new Date(rawDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0];

        payments.push({
          id: `SHEET-PAY-${Date.now()}-${i}`,
          email,
          payerName: name || email,
          subject: `Payment from ${name || email} (${method})`,
          from: email,
          date: formattedDate,
          amount,
          transactionRef: rawNotes.split('-')[0]?.trim() || `REF-SHEET-${i}`,
          paymentMethod: method,
          matchStatus: 'Linked',
          notes: rawNotes
        });
      }
    }

    const roster = Array.from(rosterMap.values());

    return {
      success: true,
      message: `Successfully loaded ${roster.length} active performers and ${payments.length} verified payment records from Google Sheets!`,
      roster,
      payments,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Google Sheet CSV Fetch Error:', error);
    return {
      success: false,
      message: `Failed to fetch Google Sheet CSV: ${error.message || 'Network error or sharing settings constraint'}. Ensure the sheet link or tab is set to "Anyone with the link can view".`,
      roster: MASTER_ROSTER,
      payments: [],
      timestamp: new Date().toISOString()
    };
  }
}
