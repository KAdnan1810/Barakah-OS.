/**
 * Shared domain types. Feature-specific types live in
 * src/features/<feature>/types — this file only holds cross-cutting types
 * referenced by more than one feature (e.g. an Expense references an
 * Account and a Category, both defined here).
 *
 * `src/types/database.types.ts` (generated via `npm run db:types`) holds the
 * raw Supabase-generated schema types; the types below are the app-facing,
 * hand-shaped versions used in components and hooks.
 */

export type UUID = string;
export type ISODateString = string;

export type Currency = "INR" | "USD" | "AED" | "SAR" | "GBP" | "EUR";

export type IncomeSource =
  | "salary"
  | "business"
  | "freelancing"
  | "gift"
  | "rental"
  | "investment"
  | "other";

export type AccountType =
  | "bank"
  | "cash"
  | "business"
  | "wallet"
  | "investment"
  | "other";

export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "upi"
  | "bank_transfer"
  | "cheque"
  | "other";

export type InvestmentType = "gold" | "shariah_mutual_fund" | "shariah_stock" | "sukuk";

export type GoalStatus = "in_progress" | "completed" | "paused" | "abandoned";

export interface Account {
  id: UUID;
  userId: UUID;
  name: string;
  type: AccountType;
  institution?: string;
  currentBalance: number;
  currency: Currency;
  isArchived: boolean;
  createdAt: ISODateString;
}

export interface Category {
  id: UUID;
  userId: UUID;
  name: string;
  parentCategoryId?: UUID | null;
  icon?: string;
  color?: string;
  kind: "expense" | "income";
}

export interface Transaction {
  id: UUID;
  userId: UUID;
  accountId: UUID;
  categoryId?: UUID | null;
  type: "expense" | "income" | "transfer";
  amount: number;
  currency: Currency;
  date: ISODateString;
  note?: string;
  tags?: string[];
  paymentMethod?: PaymentMethod;
  attachmentUrl?: string | null;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  createdAt: ISODateString;
}

export interface Budget {
  id: UUID;
  userId: UUID;
  categoryId: UUID;
  month: string; // YYYY-MM
  limitAmount: number;
  currency: Currency;
}

export interface Goal {
  id: UUID;
  userId: UUID;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: ISODateString | null;
  status: GoalStatus;
  currency: Currency;
}

export interface EmergencyFund {
  id: UUID;
  userId: UUID;
  targetAmount: number;
  currentAmount: number;
  monthlyExpenseBaseline: number;
  currency: Currency;
}

export interface BusinessFund {
  id: UUID;
  userId: UUID;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  currency: Currency;
}

export interface Investment {
  id: UUID;
  userId: UUID;
  type: InvestmentType;
  name: string;
  purchasePrice: number;
  currentValue: number;
  units?: number;
  purchaseDate: ISODateString;
  currency: Currency;
}

export interface EMI {
  id: UUID;
  userId: UUID;
  loanId: UUID;
  amount: number;
  dueDate: ISODateString;
  isPaid: boolean;
  paidDate?: ISODateString | null;
}

export interface Loan {
  id: UUID;
  userId: UUID;
  name: string;
  principal: number;
  outstandingBalance: number;
  isInterestFree: boolean; // Islamic finance: interest-bearing loans flagged distinctly
  startDate: ISODateString;
  tenureMonths: number;
  currency: Currency;
}

export interface NetWorthSnapshot {
  id: UUID;
  userId: UUID;
  date: ISODateString;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: Currency;
}

export interface ZakatCalculation {
  id: UUID;
  userId: UUID;
  hijriYear: string;
  nisabThreshold: number;
  totalZakatableAssets: number;
  zakatDue: number;
  isPaid: boolean;
  calculatedAt: ISODateString;
}

export interface SadaqahEntry {
  id: UUID;
  userId: UUID;
  amount: number;
  recipient?: string;
  date: ISODateString;
  note?: string;
  isRamadan: boolean;
}

export interface FinancialHealthScore {
  score: number; // 0-100
  savingsRate: number;
  emergencyFundCoverageMonths: number;
  debtToIncomeRatio: number;
  budgetAdherence: number;
}
