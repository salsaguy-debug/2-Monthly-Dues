import { RawPerformer } from '../types';

/**
 * Sanitizes and extracts ONLY the clean Payer Name from raw payer name, subject, or email text.
 * Ensures email subjects, dollar amounts ($XX.XX), payment phrasing ("received $60.00 from", "paid you", "sent you"),
 * and channel names are completely stripped out, leaving strictly the person's name (e.g., "Mateo Silva").
 */
export function sanitizePayerName(
  rawPayerName: string,
  subject?: string,
  email?: string,
  roster: RawPerformer[] = []
): string {
  const fullText = [rawPayerName, subject, email].filter(Boolean).join(' ');

  // 1. Direct Roster Name or Email Match in full text
  if (roster && roster.length > 0) {
    const fullTextLower = fullText.toLowerCase();
    for (const perf of roster) {
      if (!perf.name) continue;
      const perfNameLower = perf.name.toLowerCase().trim();
      const perfEmailLower = (perf.email || '').toLowerCase().trim();
      
      if (perfEmailLower && (email?.toLowerCase().trim() === perfEmailLower || fullTextLower.includes(perfEmailLower))) {
        return perf.name;
      }
      if (perfNameLower && fullTextLower.includes(perfNameLower)) {
        return perf.name;
      }
    }
  }

  // 2. Start from rawPayerName, or fallback to subject
  let nameStr = (rawPayerName || '').trim();

  // If rawPayerName looks like a full email subject or is missing/generic, use subject as fallback candidate
  const isGenericOrSubjectLike = !nameStr ||
    nameStr.toLowerCase().includes('received') ||
    nameStr.toLowerCase().includes('sent') ||
    nameStr.toLowerCase().includes('payment') ||
    nameStr.toLowerCase().includes('deposit') ||
    nameStr.includes('$') ||
    nameStr.toLowerCase().includes('unknown');

  if (isGenericOrSubjectLike && subject && subject.trim()) {
    nameStr = subject.trim();
  }

  // 3. Remove email artifacts and forward/reply tags
  nameStr = nameStr.replace(/^(Fwd|Re|FW|RE):\s*/gi, '');
  nameStr = nameStr.replace(/\[.*?\]/g, '');

  // 4. Extract name from common structured payment phrases
  if (/you received \$?[0-9,]+(\.[0-9]{1,2})? from /i.test(nameStr)) {
    const parts = nameStr.split(/you received \$?[0-9,]+(\.[0-9]{1,2})? from /i);
    nameStr = parts[parts.length - 1];
  } else if (/received \$?[0-9,]+(\.[0-9]{1,2})? from /i.test(nameStr)) {
    const parts = nameStr.split(/received \$?[0-9,]+(\.[0-9]{1,2})? from /i);
    nameStr = parts[parts.length - 1];
  } else if (/paid you/i.test(nameStr)) {
    nameStr = nameStr.split(/paid you/i)[0];
  } else if (/sent you/i.test(nameStr)) {
    nameStr = nameStr.split(/sent you/i)[0];
  } else if (/payment received from/i.test(nameStr)) {
    nameStr = nameStr.split(/payment received from/i)[1];
  } else if (/payment from/i.test(nameStr)) {
    nameStr = nameStr.split(/payment from/i)[1];
  } else if (/zelle transfer.*from/i.test(nameStr)) {
    nameStr = nameStr.split(/from/i)[1];
  } else if (/direct deposit:?/i.test(nameStr)) {
    nameStr = nameStr.replace(/direct deposit:?/gi, '');
  }

  // 5. Strip out dollar amounts ($15, $60.00, etc.)
  nameStr = nameStr.replace(/\$?[0-9,]+(\.[0-9]{1,2})?(\s*USD)?/gi, '');

  // 6. Strip out common payment platform & administrative keywords
  const noiseKeywords = [
    'venmo', 'cash app', 'cash', 'zelle', 'salsa richmond', 'salsa',
    'notification', 'received', 'sent', 'payment', 'paid', 'transfer',
    'deposit', 'dues', 'dues paid', 'for april', 'for may', 'for june',
    'for july', 'for august', 'for september', 'for october', 'for november',
    'for december', 'dues covered', 'april', 'may', 'june', 'july',
    'august', 'september', 'october', 'november', 'december', 'direct',
    'unknown', 'payer', 'gmail'
  ];

  let words = nameStr.split(/\s+/);
  words = words.filter(w => {
    const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
    return cleanW && !noiseKeywords.includes(cleanW);
  });

  nameStr = words.join(' ').replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'\.\-]/g, '').trim();

  // 7. Try fuzzy matching against roster if still unmatched
  if (nameStr && roster && roster.length > 0) {
    const cleanedLower = nameStr.toLowerCase();
    for (const perf of roster) {
      const perfLower = perf.name.toLowerCase();
      const perfParts = perfLower.split(' ');
      const cleanParts = cleanedLower.split(' ');
      
      const hasOverlap = cleanParts.some(p => p.length > 2 && perfParts.some(pp => pp === p || pp.includes(p) || p.includes(pp)));
      if (hasOverlap) {
        return perf.name;
      }
    }
  }

  // 8. Capitalize name words properly if nameStr valid
  if (nameStr.length >= 2) {
    return nameStr
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // 9. If all else fails and email is provided, derive name from email handle (e.g. mateo.silva -> Mateo Silva)
  if (email && email.includes('@') && email !== 'unknown.payer@gmail.com') {
    const handle = email.split('@')[0].replace(/[\._\-]/g, ' ');
    return handle
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return 'Unknown Payer';
}
