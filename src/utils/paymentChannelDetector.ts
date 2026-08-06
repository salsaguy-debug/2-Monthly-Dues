import { PaymentMethod } from '../types';

/**
 * Accurately detects or refines the Payment Channel (Method) from
 * explicit method string, subject, sender email, notes, or transaction reference.
 */
export function detectPaymentMethod(
  method?: string | null,
  subject?: string | null,
  fromAddress?: string | null,
  notes?: string | null,
  transactionRef?: string | null
): PaymentMethod {
  const text = [subject, fromAddress, notes, transactionRef].filter(Boolean).join(' ').toLowerCase();

  // 1. Zelle
  if (
    text.includes('zelle') ||
    text.includes('zellepay') ||
    text.includes('notify@zellepay.com') ||
    (transactionRef && (transactionRef.startsWith('ZL-') || transactionRef.startsWith('ZEL-')))
  ) {
    return 'Zelle';
  }

  // 2. Cash App
  if (
    text.includes('cash app') ||
    text.includes('cash.app') ||
    text.includes('cash@square.com') ||
    text.includes('square.com') ||
    (transactionRef && (transactionRef.startsWith('CA-') || transactionRef.startsWith('CASH-')))
  ) {
    return 'Cash App';
  }

  // 3. Direct / Salsa Richmond
  if (
    text.includes('salsa richmond') ||
    text.includes('salsarichmond') ||
    text.includes('salsaguy@salsarichmond.com') ||
    text.includes('billing@salsarichmond.com') ||
    (transactionRef && (transactionRef.startsWith('SR-') || transactionRef.startsWith('SALSA-')))
  ) {
    return 'Direct / Salsa Richmond';
  }

  // 4. Debt Collection
  if (
    text.includes('debt collection') ||
    text.includes('debt') ||
    text.includes('collection') ||
    (transactionRef && (transactionRef.startsWith('DC-') || transactionRef.startsWith('DEBT-')))
  ) {
    return 'Debt Collection';
  }

  // 5. Venmo
  if (
    text.includes('venmo') ||
    text.includes('venmo@venmo.com') ||
    (transactionRef && (transactionRef.startsWith('VN-') || transactionRef.startsWith('VEN-')))
  ) {
    return 'Venmo';
  }

  // 6. Manual / Cash
  if (
    text.includes('manual') ||
    text.includes('cash') ||
    text.includes('treasurer@tradicion.org') ||
    (transactionRef && transactionRef.startsWith('MS-'))
  ) {
    return 'Manual / Cash';
  }

  // 7. Fallback to passed method string if valid
  if (method) {
    const validMethods: PaymentMethod[] = [
      'Venmo',
      'Zelle',
      'Cash App',
      'Direct / Salsa Richmond',
      'Manual / Cash',
      'Debt Collection'
    ];
    const match = validMethods.find(m => m.toLowerCase() === method.toLowerCase().trim());
    if (match) return match;
  }

  return 'Manual / Cash';
}
