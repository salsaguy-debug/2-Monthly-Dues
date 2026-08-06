import { PaymentRecord, PaymentMethod, RawPerformer, SystemSettings } from '../types';
import { syncGmailPayments, extractNameFromEmailText } from '../services/gmailSync';
import { sanitizePayerName } from './payerSanitizer';
import { extractPaymentAmount } from './amountSanitizer';
import { detectPaymentMethod } from './paymentChannelDetector';
import { DEFAULT_SETTINGS } from '../data/defaultData';

export interface GmailConnectorConfig {
  appsScriptUrl?: string; // Optional Google Apps Script web app endpoint URL
}

/**
 * Service Layer: Triggers trackVenmoPayments logic either via direct OAuth Gmail API queries
 * or via a deployed Google Apps Script Web App Endpoint.
 * 
 * Accurately parses payment notifications from Venmo, Cash App, and Salsa Richmond,
 * matches performers against the active roster, and returns structured PaymentRecords
 * ready to be committed into React state.
 */
export async function triggerTrackVenmoPayments(params: {
  accessToken?: string | null;
  roster: RawPerformer[];
  existingPayments: PaymentRecord[];
  settings?: SystemSettings;
  config?: GmailConnectorConfig;
  customQuery?: string;
}): Promise<{
  success: boolean;
  newPayments: PaymentRecord[];
  syncedCount: number;
  message: string;
}> {
  const { accessToken, roster, existingPayments, config, customQuery } = params;

  // Option A: If a Google Apps Script Web App URL is provided in config, attempt to trigger endpoint
  if (config?.appsScriptUrl) {
    try {
      const response = await fetch(config.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trackVenmoPayments',
          roster,
          existingIds: existingPayments.map(p => p.id)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.payments)) {
          return {
            success: true,
            newPayments: data.payments,
            syncedCount: data.payments.length,
            message: `Successfully executed trackVenmoPayments via Apps Script. Gathered ${data.payments.length} new records.`
          };
        }
      }
    } catch (appsScriptError) {
      console.warn('Apps Script Web App endpoint failed, falling back to direct OAuth Gmail API:', appsScriptError);
    }
  }

  // Option B: Direct OAuth Gmail API Extraction Engine (Executing trackVenmoPayments regex and parsing logic)
  if (!accessToken) {
    return {
      success: false,
      newPayments: [],
      syncedCount: 0,
      message: 'Authentication token is required to execute trackVenmoPayments.'
    };
  }

  try {
    const { newPayments, syncedCount } = await syncGmailPayments(accessToken, roster, existingPayments, customQuery);

    return {
      success: true,
      newPayments,
      syncedCount,
      message: syncedCount > 0
        ? `Successfully gathered ${syncedCount} new payment notification(s) from Gmail.`
        : 'Scan complete. No new Venmo, Cash App, or Salsa Richmond payment emails found.'
    };
  } catch (error: any) {
    return {
      success: false,
      newPayments: [],
      syncedCount: 0,
      message: error.message || 'An error occurred while tracking payments from Gmail.'
    };
  }
}

/**
 * Dry Run Engine: Simulates pulling payment notifications from Gmail (Venmo, Cash App, Salsa Richmond),
 * parsing the email text using extractNameFromEmail logic, auto-linking to the active roster,
 * and returning realistic payment records for testing and verification without requiring live inbox emails.
 */
export function executeDryRunImport(
  roster: RawPerformer[],
  existingPayments: PaymentRecord[]
): {
  success: boolean;
  newPayments: PaymentRecord[];
  syncedCount: number;
  message: string;
} {
  const existingRefs = new Set(existingPayments.map(p => p.transactionRef));

  // Filter out system administrative emails to pick real active dancers
  const activeDancers = roster.filter(p => !DEFAULT_SETTINGS.EXCLUDED_PERFORMERS.includes(p.email.toLowerCase()));

  const samplePerformers = activeDancers.length > 0 ? activeDancers : [
    { name: 'Mateo Silva', email: 'mateo.silva@tradicion.org' },
    { name: 'Sofia Reyes', email: 'sofia.reyes@tradicion.org' },
    { name: 'Carlos Mendoza', email: 'carlos.mendoza@tradicion.org' }
  ];

  const now = new Date();

  const mockEmails = [
    {
      msgId: `DRY-${Date.now()}-1`,
      subject: `${samplePerformers[0]?.name || 'Mateo Silva'} paid you $15.00`,
      body: `Venmo Payment Notification\n${samplePerformers[0]?.name || 'Mateo Silva'} paid you $15.00 for July Dues`,
      fromAddress: 'venmo@venmo.com',
      method: 'Venmo' as PaymentMethod,
      ref: `GMAIL-DRY-VEN-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      msgId: `DRY-${Date.now()}-2`,
      subject: `You were sent $15.00 by ${samplePerformers[1 % samplePerformers.length]?.name || 'Sofia Reyes'}`,
      body: `Cash App: ${samplePerformers[1 % samplePerformers.length]?.name || 'Sofia Reyes'} sent you $15.00`,
      fromAddress: 'cash@square.com',
      method: 'Cash App' as PaymentMethod,
      ref: `GMAIL-DRY-CSH-${Math.floor(1000 + Math.random() * 9000)}`
    },
    {
      msgId: `DRY-${Date.now()}-3`,
      subject: `Payment received from Salsa Guy / Salsa Richmond`,
      body: `You received $30.00 from Salsa Richmond for ${samplePerformers[2 % samplePerformers.length]?.name || 'Carlos Mendoza'}`,
      fromAddress: 'salsaguy@salsarichmond.com',
      method: 'Direct / Salsa Richmond' as PaymentMethod,
      ref: `GMAIL-DRY-SLS-${Math.floor(1000 + Math.random() * 9000)}`
    }
  ];

  const generatedRecords: PaymentRecord[] = [];

  for (const item of mockEmails) {
    if (existingRefs.has(item.ref)) continue;

    const record = parseRawEmailToPaymentRecord(
      item.subject,
      item.body,
      item.fromAddress,
      item.msgId,
      now.getTime().toString(),
      roster
    );

    record.transactionRef = item.ref;
    record.paymentMethod = item.method;
    generatedRecords.push(record);
  }

  return {
    success: true,
    newPayments: generatedRecords,
    syncedCount: generatedRecords.length,
    message: generatedRecords.length > 0
      ? `Dry run successful! Generated ${generatedRecords.length} simulated payment notification records from Venmo, Cash App, and Salsa Richmond.`
      : 'Dry run completed. All sample dry-run records have already been imported.'
  };
}

/**
 * Helper to process raw email threads directly into PaymentRecords (conforming to Code.gs extractNameFromEmail)
 */
export function parseRawEmailToPaymentRecord(
  subject: string,
  body: string,
  fromAddress: string,
  msgId: string,
  internalDate: string,
  roster: RawPerformer[]
): PaymentRecord {
  const singleLineText = (subject + ' ' + body).replace(/\n/g, ' ');

  // Amount extraction
  const amount = extractPaymentAmount(0, subject, '', body);

  // Determine Payment Method
  const paymentMethod = detectPaymentMethod('', subject, fromAddress, body);

  // Extract Name using Code.gs matching rules
  const { payerName, matchedEmail } = extractNameFromEmailText(subject, body, roster);

  let dateStr = new Date().toISOString().split('T')[0];
  if (internalDate) {
    const d = new Date(parseInt(internalDate, 10));
    if (!isNaN(d.getTime())) {
      dateStr = d.toISOString().split('T')[0];
    }
  }

  return {
    id: msgId,
    email: matchedEmail,
    payerName: payerName || 'Gmail Payer',
    subject: subject || 'Payment Notification',
    from: fromAddress,
    date: dateStr,
    amount,
    transactionRef: `GMAIL-${msgId.slice(0, 8).toUpperCase()}`,
    paymentMethod,
    matchStatus: matchedEmail ? 'Linked' : 'Review Needed'
  };
}
