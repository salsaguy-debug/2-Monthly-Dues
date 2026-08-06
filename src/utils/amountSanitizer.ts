/**
 * Safely extracts or recovers the numerical payment amount from a PaymentRecord or text.
 * Checks existing numerical amount first. If 0, null, NaN, or undefined, it searches
 * subject, notes, body, or raw text for currency expressions (e.g. "$15.00", "$15", "15 USD").
 */
export function extractPaymentAmount(
  amount?: number | string | null,
  subject?: string,
  notes?: string,
  body?: string
): number {
  if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
    return amount;
  }

  if (typeof amount === 'string') {
    const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  const combinedText = [subject, notes, body].filter(Boolean).join(' ');
  if (!combinedText) return 0;

  // Regex 1: Explicit dollar sign match like $15.00, $15, $150.00
  const dollarMatch = combinedText.match(/\$([0-9,]+(?:\.[0-9]{1,2})?)/);
  if (dollarMatch && dollarMatch[1]) {
    const val = parseFloat(dollarMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) return val;
  }

  // Regex 2: Amount with USD / dollars e.g. "15 USD", "15.00 dollars"
  const usdMatch = combinedText.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:usd|dollars?)/i);
  if (usdMatch && usdMatch[1]) {
    const val = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) return val;
  }

  // Regex 3: Pattern like "payment of 15" or "paid 15" or "15.00 payment"
  const contextMatch = combinedText.match(/(?:payment|paid|received|dues|amount|deposit|total)\s*:?\s*\$?([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (contextMatch && contextMatch[1]) {
    const val = parseFloat(contextMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) return val;
  }

  return 0;
}
