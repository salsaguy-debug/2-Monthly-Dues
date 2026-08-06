/**
 * Utility functions for Tradición Financial System 7.0.0
 */

/**
 * Returns the Date object corresponding to the 1st Monday of the specified month in a year
 * @param year e.g. 2026
 * @param monthIndex 0-indexed (0 = Jan, 3 = April, 11 = Dec)
 */
export function getFirstMonday(year: number, monthIndex: number): Date {
  const date = new Date(year, monthIndex, 1, 23, 59, 59, 999);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ...
  
  // Day difference to reach Monday
  let daysToAdd = 0;
  if (dayOfWeek === 1) {
    daysToAdd = 0;
  } else if (dayOfWeek === 0) {
    daysToAdd = 1; // Sunday -> Monday is 1 day
  } else {
    daysToAdd = 8 - dayOfWeek; // e.g. Tuesday (2) -> 8 - 2 = 6 days to next Monday
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

/**
 * Calculates weeks overdue between due date and target date
 */
export function getWeeksOverdue(dueDate: Date, checkDate: Date = new Date()): number {
  if (checkDate <= dueDate) return 0;
  
  const diffTime = checkDate.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 0;
  
  // Weekly calculation (1 day overdue = 1 week penalty started)
  return Math.ceil(diffDays / 7);
}

/**
 * Calculates late fee according to business rules:
 * - $5.00 per week overdue
 * - Capped at MAX_LATE_FEE ($30.00 max)
 */
export function calculateLateFee(
  weeksLate: number,
  weeklyFee: number = 5.0,
  maxFee: number = 30.0
): number {
  if (weeksLate <= 0) return 0;
  return Math.min(weeksLate * weeklyFee, maxFee);
}

/**
 * Formats currency values consistently
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Gets formatted month string e.g. "April 2026"
 */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

export const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
