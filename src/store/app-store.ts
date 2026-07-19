import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Account,
  Budget,
  BusinessFund,
  Category,
  EMI,
  EmergencyFund,
  Goal,
  Investment,
  Loan,
  NetWorthSnapshot,
  SadaqahEntry,
  Transaction,
  ZakatCalculation,
} from "@/types";

/**
 * Central client-side data store for demo/local mode.
 *
 * This is the single source of truth the whole app reads from when Supabase
 * isn't configured (see src/services/supabaseClient.ts). Every feature's
 * `api/` hook reads and writes through the actions here. When Supabase is
 * configured, swap these actions for real supabase-js calls + TanStack Query
 * mutations — the shapes match the database schema 1:1 so the swap is
 * mechanical, not a rewrite.
 */

const uid = () => crypto.randomUUID();
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthsAgoISO = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
};
const currentMonth = () => new Date().toISOString().slice(0, 7);

// ---------------------------------------------------------------------------
// Seed data — realistic-feeling demo numbers in INR
// ---------------------------------------------------------------------------

const seedAccounts: Account[] = [
  { id: "acc-hdfc", userId: "demo", name: "HDFC Savings", type: "bank", institution: "HDFC Bank", currentBalance: 184500, currency: "INR", isArchived: false, createdAt: monthsAgoISO(18) },
  { id: "acc-union", userId: "demo", name: "Union Bank", type: "bank", institution: "Union Bank of India", currentBalance: 62300, currency: "INR", isArchived: false, createdAt: monthsAgoISO(24) },
  { id: "acc-cash", userId: "demo", name: "Cash Wallet", type: "cash", currentBalance: 4200, currency: "INR", isArchived: false, createdAt: monthsAgoISO(24) },
  { id: "acc-biz", userId: "demo", name: "Business Account", type: "business", institution: "HDFC Bank", currentBalance: 312000, currency: "INR", isArchived: false, createdAt: monthsAgoISO(12) },
];

const expenseCategories: Category[] = [
  { id: "cat-food", userId: "demo", name: "Food & Groceries", icon: "utensils", color: "#16a34a", kind: "expense" },
  { id: "cat-rent", userId: "demo", name: "Rent & Housing", icon: "home", color: "#0ea5e9", kind: "expense" },
  { id: "cat-transport", userId: "demo", name: "Transport", icon: "car", color: "#f59e0b", kind: "expense" },
  { id: "cat-utilities", userId: "demo", name: "Utilities", icon: "zap", color: "#8b5cf6", kind: "expense" },
  { id: "cat-family", userId: "demo", name: "Family & Kids", icon: "users", color: "#ec4899", kind: "expense" },
  { id: "cat-health", userId: "demo", name: "Health", icon: "heart-pulse", color: "#ef4444", kind: "expense" },
  { id: "cat-shopping", userId: "demo", name: "Shopping", icon: "shopping-bag", color: "#14b8a6", kind: "expense" },
  { id: "cat-other-exp", userId: "demo", name: "Other", icon: "more-horizontal", color: "#6b7280", kind: "expense" },
];

const incomeCategories: Category[] = [
  { id: "cat-salary", userId: "demo", name: "Salary", icon: "briefcase", color: "#16a34a", kind: "income" },
  { id: "cat-business-inc", userId: "demo", name: "Business", icon: "store", color: "#0ea5e9", kind: "income" },
  { id: "cat-freelance", userId: "demo", name: "Freelancing", icon: "laptop", color: "#f59e0b", kind: "income" },
  { id: "cat-rental-inc", userId: "demo", name: "Rental", icon: "building", color: "#8b5cf6", kind: "income" },
  { id: "cat-other-inc", userId: "demo", name: "Other", icon: "more-horizontal", color: "#6b7280", kind: "income" },
];

function seedTransactions(): Transaction[] {
  const tx: Transaction[] = [];
  const expenseCats = expenseCategories.map((c) => c.id);
  const push = (t: Omit<Transaction, "id" | "userId" | "currency" | "isRecurring" | "createdAt">) =>
    tx.push({
      id: uid(),
      userId: "demo",
      currency: "INR",
      isRecurring: false,
      createdAt: new Date().toISOString(),
      ...t,
    });

  // Recurring monthly salary, last 4 months
  for (let m = 0; m < 4; m++) {
    push({ accountId: "acc-hdfc", categoryId: "cat-salary", type: "income", amount: 145000, date: monthsAgoISO(m) });
  }
  // Business income, sporadic
  push({ accountId: "acc-biz", categoryId: "cat-business-inc", type: "income", amount: 68000, date: monthsAgoISO(0) });
  push({ accountId: "acc-biz", categoryId: "cat-business-inc", type: "income", amount: 52000, date: monthsAgoISO(1) });
  push({ accountId: "acc-hdfc", categoryId: "cat-freelance", type: "income", amount: 22000, date: monthsAgoISO(0) });

  // Expenses across this month + last 2 months
  const monthlyExpensePlan: Array<[string, number, string]> = [
    ["cat-rent", 32000, "acc-hdfc"],
    ["cat-food", 14500, "acc-hdfc"],
    ["cat-transport", 6200, "acc-cash"],
    ["cat-utilities", 4800, "acc-hdfc"],
    ["cat-family", 9000, "acc-union"],
    ["cat-health", 3200, "acc-hdfc"],
    ["cat-shopping", 11500, "acc-hdfc"],
    ["cat-other-exp", 2600, "acc-cash"],
  ];
  for (let m = 0; m < 3; m++) {
    for (const [cat, amt, acc] of monthlyExpensePlan) {
      const jitter = 1 + ((Math.sin(m * 7 + amt) + 1) / 10); // deterministic variance
      push({
        accountId: acc,
        categoryId: cat,
        type: "expense",
        amount: Math.round(amt * jitter),
        date: monthsAgoISO(m),
        paymentMethod: acc === "acc-cash" ? "cash" : "upi",
        note: expenseCategories.find((c) => c.id === cat)?.name,
      });
    }
  }
  return tx.sort((a, b) => (a.date < b.date ? 1 : -1));
}

const seedBudgets: Budget[] = expenseCategories.map((c, i) => ({
  id: uid(),
  userId: "demo",
  categoryId: c.id,
  month: currentMonth(),
  limitAmount: [35000, 15000, 6000, 5000, 10000, 4000, 8000, 3000][i] ?? 5000,
  currency: "INR",
}));

const seedGoals: Goal[] = [
  { id: uid(), userId: "demo", name: "Umrah Trip", targetAmount: 250000, currentAmount: 96000, deadline: monthsAgoISO(-8), status: "in_progress", currency: "INR" },
  { id: uid(), userId: "demo", name: "New Laptop", targetAmount: 120000, currentAmount: 85000, deadline: monthsAgoISO(-3), status: "in_progress", currency: "INR" },
  { id: uid(), userId: "demo", name: "Child's Education Fund", targetAmount: 800000, currentAmount: 210000, deadline: monthsAgoISO(-36), status: "in_progress", currency: "INR" },
];

const seedEmergencyFund: EmergencyFund = {
  id: uid(),
  userId: "demo",
  targetAmount: 300000,
  currentAmount: 168000,
  monthlyExpenseBaseline: 83800,
  currency: "INR",
};

const seedBusinessFund: BusinessFund = {
  id: uid(),
  userId: "demo",
  targetAmount: 500000,
  currentAmount: 187000,
  monthlyContribution: 25000,
  currency: "INR",
};

const seedInvestments: Investment[] = [
  { id: uid(), userId: "demo", type: "gold", name: "Digital Gold (SGB-linked)", purchasePrice: 85000, currentValue: 98500, units: 12.4, purchaseDate: monthsAgoISO(14), currency: "INR" },
  { id: uid(), userId: "demo", type: "shariah_mutual_fund", name: "Tata Ethical Fund", purchasePrice: 150000, currentValue: 178200, units: 2140.5, purchaseDate: monthsAgoISO(20), currency: "INR" },
  { id: uid(), userId: "demo", type: "shariah_stock", name: "TCS", purchasePrice: 90000, currentValue: 104300, units: 22, purchaseDate: monthsAgoISO(10), currency: "INR" },
  { id: uid(), userId: "demo", type: "sukuk", name: "Sukuk Al-Ijarah Bond", purchasePrice: 100000, currentValue: 106800, units: 100, purchaseDate: monthsAgoISO(6), currency: "INR" },
];

const seedLoans: Loan[] = [
  { id: "loan-home", userId: "demo", name: "Home Financing (Murabaha)", principal: 2200000, outstandingBalance: 1640000, isInterestFree: true, startDate: monthsAgoISO(30), tenureMonths: 180, currency: "INR" },
];

const seedEmis: EMI[] = Array.from({ length: 3 }).map((_, i) => ({
  id: uid(),
  userId: "demo",
  loanId: "loan-home",
  amount: 18500,
  dueDate: i === 0 ? monthsAgoISO(-1) : monthsAgoISO(i - 1),
  isPaid: i !== 0,
  paidDate: i !== 0 ? monthsAgoISO(i - 1) : null,
}));

const seedNetWorth: NetWorthSnapshot[] = Array.from({ length: 6 }).map((_, i) => {
  const m = 5 - i;
  const totalAssets = 950000 + i * 62000;
  const totalLiabilities = 1750000 - i * 18000;
  return {
    id: uid(),
    userId: "demo",
    date: monthsAgoISO(m),
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    currency: "INR",
  };
});

const seedZakat: ZakatCalculation[] = [
  {
    id: uid(),
    userId: "demo",
    hijriYear: "1446",
    nisabThreshold: 585000,
    totalZakatableAssets: 612000,
    zakatDue: 15300,
    isPaid: false,
    calculatedAt: monthsAgoISO(1),
  },
];

const seedSadaqah: SadaqahEntry[] = [
  { id: uid(), userId: "demo", amount: 5000, recipient: "Local orphanage", date: monthsAgoISO(1), isRamadan: false },
  { id: uid(), userId: "demo", amount: 12000, recipient: "Masjid fundraiser", date: monthsAgoISO(4), note: "Ramadan drive", isRamadan: true },
  { id: uid(), userId: "demo", amount: 2500, recipient: "Flood relief", date: monthsAgoISO(2), isRamadan: false },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  emergencyFund: EmergencyFund;
  businessFund: BusinessFund;
  investments: Investment[];
  loans: Loan[];
  emis: EMI[];
  netWorthHistory: NetWorthSnapshot[];
  zakatHistory: ZakatCalculation[];
  sadaqahEntries: SadaqahEntry[];

  addTransaction: (t: Omit<Transaction, "id" | "userId" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, "id" | "userId">) => void;
  updateBudget: (id: string, limitAmount: number) => void;
  addGoal: (g: Omit<Goal, "id" | "userId" | "status">) => void;
  contributeToGoal: (id: string, amount: number) => void;
  addInvestment: (i: Omit<Investment, "id" | "userId">) => void;
  contributeEmergencyFund: (amount: number) => void;
  contributeBusinessFund: (amount: number) => void;
  addSadaqah: (s: Omit<SadaqahEntry, "id" | "userId">) => void;
  markEmiPaid: (id: string) => void;
  addAccount: (a: Omit<Account, "id" | "userId" | "createdAt">) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      accounts: seedAccounts,
      categories: [...expenseCategories, ...incomeCategories],
      transactions: seedTransactions(),
      budgets: seedBudgets,
      goals: seedGoals,
      emergencyFund: seedEmergencyFund,
      businessFund: seedBusinessFund,
      investments: seedInvestments,
      loans: seedLoans,
      emis: seedEmis,
      netWorthHistory: seedNetWorth,
      zakatHistory: seedZakat,
      sadaqahEntries: seedSadaqah,

      addTransaction: (t) =>
        set((s) => {
          const tx: Transaction = { ...t, id: uid(), userId: "demo", createdAt: new Date().toISOString() };
          const accounts = s.accounts.map((a) => {
            if (a.id !== t.accountId) return a;
            const delta = t.type === "income" ? t.amount : -t.amount;
            return { ...a, currentBalance: a.currentBalance + delta };
          });
          return { transactions: [tx, ...s.transactions], accounts };
        }),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addBudget: (b) => set((s) => ({ budgets: [...s.budgets, { ...b, id: uid(), userId: "demo" }] })),

      updateBudget: (id, limitAmount) =>
        set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? { ...b, limitAmount } : b)) })),

      addGoal: (g) =>
        set((s) => ({ goals: [...s.goals, { ...g, id: uid(), userId: "demo", status: "in_progress" }] })),

      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== id) return g;
            const currentAmount = g.currentAmount + amount;
            return {
              ...g,
              currentAmount,
              status: currentAmount >= g.targetAmount ? "completed" : g.status,
            };
          }),
        })),

      addInvestment: (i) =>
        set((s) => ({ investments: [...s.investments, { ...i, id: uid(), userId: "demo" }] })),

      contributeEmergencyFund: (amount) =>
        set((s) => ({ emergencyFund: { ...s.emergencyFund, currentAmount: s.emergencyFund.currentAmount + amount } })),

      contributeBusinessFund: (amount) =>
        set((s) => ({ businessFund: { ...s.businessFund, currentAmount: s.businessFund.currentAmount + amount } })),

      addSadaqah: (entry) =>
        set((s) => ({ sadaqahEntries: [{ ...entry, id: uid(), userId: "demo" }, ...s.sadaqahEntries] })),

      markEmiPaid: (id) =>
        set((s) => ({
          emis: s.emis.map((e) => (e.id === id ? { ...e, isPaid: true, paidDate: todayISO() } : e)),
        })),

      addAccount: (a) =>
        set((s) => ({ accounts: [...s.accounts, { ...a, id: uid(), userId: "demo", createdAt: new Date().toISOString() }] })),
    }),
    { name: "barakah-os-demo-store" }
  )
);
