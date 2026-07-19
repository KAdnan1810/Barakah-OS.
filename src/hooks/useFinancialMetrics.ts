import { useMemo } from "react";
import { useAppStore } from "@store/app-store";
import type { FinancialHealthScore } from "@/types";

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

/**
 * Centralized derived-metrics hook. Every page that needs "this month's
 * income/expenses", category breakdowns, or the financial health score reads
 * from here so the calculation logic exists in exactly one place.
 */
export function useFinancialMetrics() {
  const { transactions, categories, budgets, emergencyFund, loans, goals } = useAppStore();

  return useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const monthTx = (month: string) => transactions.filter((t) => monthKey(t.date) === month);

    const sum = (txs: typeof transactions, type: "income" | "expense") =>
      txs.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0);

    const thisMonthTx = monthTx(thisMonth);
    const lastMonthTx = monthTx(lastMonth);

    const monthlyIncome = sum(thisMonthTx, "income");
    const monthlyExpenses = sum(thisMonthTx, "expense");
    const lastMonthIncome = sum(lastMonthTx, "income");
    const lastMonthExpenses = sum(lastMonthTx, "expense");

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const expenseByCategory = categories
      .filter((c) => c.kind === "expense")
      .map((cat) => ({
        category: cat,
        amount: thisMonthTx.filter((t) => t.type === "expense" && t.categoryId === cat.id).reduce((a, t) => a + t.amount, 0),
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const topCategory = expenseByCategory[0];

    const budgetVsActual = budgets
      .filter((b) => b.month === thisMonth)
      .map((b) => {
        const spent = thisMonthTx
          .filter((t) => t.type === "expense" && t.categoryId === b.categoryId)
          .reduce((a, t) => a + t.amount, 0);
        const category = categories.find((c) => c.id === b.categoryId);
        return {
          budget: b,
          category,
          spent,
          remaining: b.limitAmount - spent,
          percentUsed: b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0,
        };
      })
      .sort((a, b) => b.percentUsed - a.percentUsed);

    const totalOutstandingDebt = loans.reduce((a, l) => a + l.outstandingBalance, 0);
    const debtToIncomeRatio = monthlyIncome > 0 ? totalOutstandingDebt / (monthlyIncome * 12) : 0;
    const emergencyFundCoverageMonths =
      emergencyFund.monthlyExpenseBaseline > 0
        ? emergencyFund.currentAmount / emergencyFund.monthlyExpenseBaseline
        : 0;
    const overBudgetCount = budgetVsActual.filter((b) => b.percentUsed > 100).length;
    const budgetAdherence =
      budgetVsActual.length > 0 ? ((budgetVsActual.length - overBudgetCount) / budgetVsActual.length) * 100 : 100;

    const healthScore: FinancialHealthScore = {
      score: Math.round(
        Math.max(
          0,
          Math.min(
            100,
            savingsRate * 0.35 +
              Math.min(emergencyFundCoverageMonths / 6, 1) * 100 * 0.3 +
              (1 - Math.min(debtToIncomeRatio, 1)) * 100 * 0.2 +
              budgetAdherence * 0.15
          )
        )
      ),
      savingsRate,
      emergencyFundCoverageMonths,
      debtToIncomeRatio,
      budgetAdherence,
    };

    const activeGoals = goals.filter((g) => g.status === "in_progress");

    return {
      thisMonth,
      monthlyIncome,
      monthlyExpenses,
      lastMonthIncome,
      lastMonthExpenses,
      incomeDelta: lastMonthIncome > 0 ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0,
      expenseDelta: lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0,
      savingsRate,
      expenseByCategory,
      topCategory,
      budgetVsActual,
      healthScore,
      activeGoals,
      totalOutstandingDebt,
    };
  }, [transactions, categories, budgets, emergencyFund, loans, goals]);
}
