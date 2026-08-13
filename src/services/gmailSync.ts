import { PaymentRecord, PaymentMethod, RawPerformer } from '../types';
import { sanitizePayerName } from '../utils/payerSanitizer';
import { extractPaymentAmount } from '../utils/amountSanitizer';
import { detectPaymentMethod } from '../utils/paymentChannelDetector';

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessageDetail {
  id: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: GmailMessageHeader[];
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string }; mimeType?: string }>;
  };
}

// Decodes Base64Url string from Gmail API
function decodeBase64Url(base64Url: string): string {
  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return jsonPayload;
  } catch {
    return '';
  }
}

/**
 * Filter out non-payment marketing notifications, security alerts, bank connection emails,
 * outbound payments, request emails, and non-performer topics.
 */
export function isIrrelevantEmail(subject: string, bodyText: string): boolean {
  const fullText = (subject + ' ' + bodyText).toLowerCase();

  // Exclude marketing, promotional, and referral offers
  const marketingPhrases = [
    "don't forget: $", "wanna make $", "bonus offer", "cash back",
    "summer heat", "taco bell", "game time", "referral", "bonus",
    "what's the crew", "last call", "whatnot"
  ];
  if (marketingPhrases.some(p => fullText.includes(p))) return true;

  // Exclude account, security, device, and bank transfer notifications
  const securityPhrases = [
    "new device login", "device added", "bank was added", "bank account has been added",
    "connected your bank", "backup payment method", "updated your preferred",
    "transfer has been initiated", "upcoming changes to", "transaction history",
    "statement", "login", "remembered device", "card ending in"
  ];
  if (securityPhrases.some(p => fullText.includes(p))) return true;

  // Exclude payment requests, outgoing payments, and expired transfers
  const outboundOrRequestPhrases = [
    "requests $", "requested $", "payment to", "expired", "you paid"
  ];
  if (outboundOrRequestPhrases.some(p => fullText.includes(p))) return true;

  // Exclude non-dues email topics
  if (fullText.includes("va disability assistance")) return true;

  return false;
}

// Extracts clean payer name from subject or body based on roster & sanitization rules
export function extractNameFromEmailText(
  subject: string,
  bodyText: string,
  roster: RawPerformer[]
): { payerName: string; matchedEmail: string } {
  const fullText = (subject + ' ' + bodyText).replace(/\n/g, ' ');
  const lowerFull = fullText.toLowerCase();

  // 1. Direct name, email, or email username match
  for (const perf of roster) {
    if (!perf.name && !perf.email) continue;
    const nameLower = (perf.name || '').toLowerCase().trim();
    const emailLower = (perf.email || '').toLowerCase().trim();
    const emailUser = emailLower.split('@')[0];

    if (nameLower && lowerFull.includes(nameLower)) {
      return { payerName: perf.name, matchedEmail: perf.email };
    }
    if (emailLower && lowerFull.includes(emailLower)) {
      return { payerName: perf.name, matchedEmail: perf.email };
    }
    if (emailUser.length >= 4 && lowerFull.includes(emailUser)) {
      return { payerName: perf.name, matchedEmail: perf.email };
    }
  }

  // 2. Token / word matching against roster names (e.g., "Meyboll", "Febres", "Sampson", "Gonzales")
  for (const perf of roster) {
    const nameParts = (perf.name || '').toLowerCase().split(/\s+/).filter(p => p.length >= 4);
    for (const part of nameParts) {
      if (['paid', 'from', 'with', 'your', 'sent', 'text', 'message'].includes(part)) continue;
      if (lowerFull.includes(part)) {
        return { payerName: perf.name, matchedEmail: perf.email };
      }
    }
  }

  // 3. Parse common payment phrasing with Regex
  let rawPayer = 'Unknown Payer';
  const cleanSub = subject.replace(/Fwd:|Re:|\[.*?\]/gi, '').trim();
  const lowerSub = cleanSub.toLowerCase();

  if (lowerSub.includes('new text message from')) {
    rawPayer = cleanSub.split(/new text message from/i)[1].replace(/\(\d{3}\).*/, '').trim();
  } else if (lowerSub.includes('paid you')) {
    rawPayer = cleanSub.split(/paid you/i)[0].trim();
  } else if (lowerSub.includes('sent you')) {
    rawPayer = cleanSub.split(/sent you/i)[0].trim();
  } else if (lowerSub.includes('payment received from')) {
    rawPayer = cleanSub.split(/payment received from/i)[1].trim();
  } else {
    // Regex parsing across lines
    const lines = fullText.split(/(?:\r?\n|\. )/);
    for (const line of lines) {
      const gvoiceMatch = line.match(/(?:SMS|Text) from ([A-Za-zÀ-ÖØ-öø-ÿ \'\.\-]+)/i);
      if (gvoiceMatch && gvoiceMatch[1]) {
        rawPayer = gvoiceMatch[1].trim();
        break;
      }
      const paidMatch = line.match(/([A-Za-zÀ-ÖØ-öø-ÿ \'\.\-]+) paid you/i);
      if (paidMatch && paidMatch[1]) {
        rawPayer = paidMatch[1].trim();
        break;
      }
      const sentMatch = line.match(/([A-Za-zÀ-ÖØ-öø-ÿ \'\.\-]+) sent you/i);
      if (sentMatch && sentMatch[1]) {
        rawPayer = sentMatch[1].trim();
        break;
      }
      const receivedMatch = line.match(/You received \$[0-9,.]+ from ([A-Za-zÀ-ÖØ-öø-ÿ \.\-]+)/i);
      if (receivedMatch && receivedMatch[1]) {
        rawPayer = receivedMatch[1].trim();
        break;
      }
    }
  }

  const cleanName = sanitizePayerName(rawPayer, subject, '', roster);

  // Try matching extracted payer name against roster
  for (const perf of roster) {
    if (perf.name.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(perf.name.toLowerCase())) {
      return { payerName: perf.name, matchedEmail: perf.email };
    }
  }

  return { payerName: cleanName, matchedEmail: '' };
}

// Fetch messages from Gmail API using OAuth token
export async function syncGmailPayments(
  accessToken: string,
  roster: RawPerformer[],
  existingPayments: PaymentRecord[],
  customQuery?: string
): Promise<{ newPayments: PaymentRecord[]; syncedCount: number }> {
  // Query Gmail API for payment notifications and Google Voice text messages
  const defaultQuery = '(from:txt.voice.google.com OR "Google Voice" OR from:venmo@venmo.com OR from:cash@square.com OR from:salsaguy@salsarichmond.com OR Venmo OR "Cash App" OR "Salsa Richmond" OR "paid you" OR "sent you")';
  const query = encodeURIComponent(customQuery || defaultQuery);
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=100`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Gmail API error (${listRes.status}): ${errText}`);
  }

  const listData = await listRes.json();
  const messagesSummary: Array<{ id: string }> = listData.messages || [];

  if (messagesSummary.length === 0) {
    return { newPayments: [], syncedCount: 0 };
  }

  const existingRefs = new Set(existingPayments.map(p => p.transactionRef));
  const existingIds = new Set(existingPayments.map(p => p.id));

  const fetchedPayments: PaymentRecord[] = [];

  for (const msgRef of messagesSummary) {
    if (existingIds.has(msgRef.id)) continue;

    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`;
    const detailRes = await fetch(detailUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!detailRes.ok) continue;

    const msg: GmailMessageDetail = await detailRes.json();
    const headers = msg.payload.headers || [];

    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject');
    const fromHeader = getHeader('From');
    const dateHeader = getHeader('Date');

    // Decode Body
    let bodyText = msg.snippet || '';
    if (msg.payload.body?.data) {
      bodyText += ' ' + decodeBase64Url(msg.payload.body.data);
    }
    if (msg.payload.parts) {
      for (const part of msg.payload.parts) {
        if (part.body?.data) {
          bodyText += ' ' + decodeBase64Url(part.body.data);
        }
      }
    }

    // Skip irrelevant marketing, security, outbound, request, or statement emails
    if (isIrrelevantEmail(subject, bodyText)) continue;

    // Parse Amount ($15, $15.00, 15.00 USD, 15 USD, etc.)
    const amount = extractPaymentAmount(0, subject, '', bodyText);

    // Skip zero amount emails
    if (amount <= 0) continue;

    // Payment Channel
    const paymentMethod = detectPaymentMethod('', subject, fromHeader, bodyText);

    // Extract Name & Match Roster
    const { payerName, matchedEmail } = extractNameFromEmailText(subject, bodyText, roster);

    // Format Date
    let dateStr = new Date().toISOString().split('T')[0];
    if (dateHeader) {
      const d = new Date(dateHeader);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
      }
    } else if (msg.internalDate) {
      const d = new Date(parseInt(msg.internalDate, 10));
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
      }
    }

    const transactionRef = `GMAIL-${msg.id.slice(0, 8).toUpperCase()}`;
    if (existingRefs.has(transactionRef)) continue;

    fetchedPayments.push({
      id: msg.id,
      email: matchedEmail,
      payerName: payerName || 'Gmail Payer',
      subject: subject || 'Payment Notification',
      from: fromHeader,
      date: dateStr,
      amount,
      transactionRef,
      paymentMethod,
      matchStatus: matchedEmail ? 'Linked' : 'Review Needed'
    });
  }

  return {
    newPayments: fetchedPayments,
    syncedCount: fetchedPayments.length
  };
}
