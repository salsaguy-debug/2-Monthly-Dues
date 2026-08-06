export interface RawPerformer {
  email: string;
  name: string;
  phone?: string;
}

export type PaymentMethod = 
  | 'Venmo' 
  | 'Zelle'
  | 'Cash App' 
  | 'Direct / Salsa Richmond' 
  | 'Manual / Cash'
  | 'Debt Collection';

export type WidgetType = 
  | 'financialRuleset'
  | 'executiveSummary'
  | 'volumeTrend'
  | 'channelBreakdown'
  | 'modularArchitecture'
  | 'performanceBenchmark';

export type MatchStatus = 'Linked' | 'Review Needed' | 'Unresolved';

export type FeeAllocationTarget = 'All' | 'Late Fees' | 'Monthly Dues' | 'Debt Collection Fee';

export interface PaymentRecord {
  id: string;
  email: string;
  payerName: string;
  subject: string;
  from: string;
  date: string; // ISO string YYYY-MM-DD
  amount: number;
  transactionRef: string;
  paymentMethod: PaymentMethod;
  matchStatus: MatchStatus;
  targetFeeType?: FeeAllocationTarget;
  notes?: string;
}

export interface LedgerMonth {
  monthIndex: number; // 0-11 (Jan-Dec)
  monthName: string;
  paid: number;
  carryover: number;
  baseDues: number;
  lateFee: number;
  balance: number;
  dueDate: string; // First Monday ISO string
  isOverdue: boolean;
  weeksLate: number;
}

export interface LedgerRow {
  email: string;
  name: string;
  phone?: string;
  isExcluded: boolean;
  months: LedgerMonth[];
  totalPaid2026: number;
  owesYear: number;
  totalLateFees: number;
  status: 'Current' | '1-30 Days Overdue' | '30+ Days Overdue' | 'Excluded';
}

export interface SystemSettings {
  BASE_DUES: number;
  DUES_START_MONTH: number; // 3 = April (0-indexed)
  LATE_FEE_WEEKLY: number;
  MAX_LATE_FEE: number;
  ENABLE_DEBT_COLLECTION?: boolean;
  DEBT_COLLECTION_FEE?: number;
  EXCLUDED_PERFORMERS: string[];
  SYNC_TRIGGER_TIME: string;
  AUTO_MATCH_THRESHOLD: number;
  ENABLE_WEEKLY_EMAIL: boolean;
  WEEKLY_EMAIL_DAY: string;
  WEEKLY_EMAIL_RECIPIENT_SCOPE: 'DELINQUENT_PERFORMERS_AND_TREASURER' | 'TREASURER_EXECUTIVE_ONLY' | 'DELINQUENT_PERFORMERS_ONLY';
  TREASURER_EMAIL: string;
}

export interface ExecutiveKPIs {
  totalRevenueYTD: number;
  totalOutstandingDebt: number;
  onTimeCollectionRate: number;
  totalLateFeesCollected: number;
  activePerformersCount: number;
  excludedCount: number;
  aging: {
    current: number;
    currentAmount: number;
    days1to30: number;
    days1to30Amount: number;
    days30Plus: number;
    days30PlusAmount: number;
  };
  channelBreakdown: {
    method: PaymentMethod;
    amount: number;
    percentage: number;
    count: number;
  }[];
}

export interface DryRunLog {
  id: string;
  timestamp: string;
  testName: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  durationMs: number;
  details: string;
}
