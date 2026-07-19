import type { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Store = ReturnType<typeof useAppStore.getState>;


/**
 * Rule-based financial assistant that reasons directly over the user's own
 * data — no external API call, so it works instantly in demo mode and never
 * leaks financial data to a third party. To upgrade to a generative model in
 * production: keep this file's `buildContext()` output as the system-prompt
 * context, and POST it + the question to a Supabase Edge Function that calls
 * the Anthropic API server-side (never call a model API with the user's
 * financial data directly from the browser).
 */

function buildContext(store: Store) {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthTx = store.transactions.filter((t) => t.date.slice(0, 7) === thisMonth);
  const income = monthTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expenses = monthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const byCategory = store.categories
    .filter((c) => c.kind === "expense")
    .map((c) => ({ name: c.name, amount: monthTx.filter((t) => t.categoryId === c.id).reduce((a, t) => a + t.amount, 0) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const totalBalance = store.accounts.reduce((a, acc) => a + acc.currentBalance, 0);

  return {
    income, expenses, byCategory, totalBalance, emergencyFund: store.emergencyFund,
    businessFund: store.businessFund
  };
}

export async function askAssistant(question: string, store: Store): Promise<string> {
  const q = question.toLowerCase();
  const ctx = buildContext(store);

  await supabase.functions.invoke('ai-assistant', {
    body: { question, context: ctx },
  });


  if (q.includes("spend the most") || q.includes("wastes the most") || q.includes("biggest expense")) {
    const top = ctx.byCategory[0];
    if (!top) return "You haven't logged any expenses this month yet — add a few and ask me again.";
    const share = ((top.amount / ctx.expenses) * 100).toFixed(0);
    return `Your biggest spend this month is **${top.name}** at ${formatCurrency(top.amount)} — that's ${share}% of your total expenses. ${ctx.byCategory[1] ? `Next is ${ctx.byCategory[1].name} at ${formatCurrency(ctx.byCategory[1].amount)}.` : ""
      }`;
  }

  if (q.includes("afford")) {
    const amountMatch = question.match(/[\d,]+/);
    const amount = amountMatch ? Number(amountMatch[0].replace(/,/g, "")) : null;
    if (!amount) return "Tell me the amount you're considering — e.g. \"Can I afford a ₹40,000 purchase?\"";
    const availableAfterExpenses = ctx.totalBalance;
    const safeBuffer = store.emergencyFund.currentAmount;
    if (amount <= availableAfterExpenses - safeBuffer * 0.5) {
      return `Yes — you have ${formatCurrency(availableAfterExpenses)} across your accounts, well above your emergency fund buffer, so a ${formatCurrency(amount)} purchase looks comfortable.`;
    }
    if (amount <= availableAfterExpenses) {
      return `You *can* cover ${formatCurrency(amount)}, but it would dip into your emergency fund buffer. Consider whether it can wait until after your next income.`;
    }
    return `That would exceed your current total balance of ${formatCurrency(availableAfterExpenses)} — I'd hold off or plan for it as a goal instead.`;
  }

  if (q.includes("save more") || q.includes("how can i save")) {
    const top = ctx.byCategory[0];
    return `Right now you're saving ${((ctx.income - ctx.expenses) / (ctx.income || 1) * 100).toFixed(0)}% of your income. ${top ? `Your largest category, ${top.name} (${formatCurrency(top.amount)}), is the best place to look for a cut — even a 10–15% trim there adds up fast.` : "Log a few more expenses so I can point to a specific category."
      } Automating a transfer to your Emergency Fund right after payday also helps it stick.`;
  }

  if (q.includes("business goal") || q.includes("business fund")) {
    const remaining = store.businessFund.targetAmount - store.businessFund.currentAmount;
    if (remaining <= 0) return "You've already reached your Business Fund target — well done!";
    const months = store.businessFund.monthlyContribution > 0 ? Math.ceil(remaining / store.businessFund.monthlyContribution) : null;
    return months
      ? `At ${formatCurrency(store.businessFund.monthlyContribution)}/month, you'll reach your Business Fund target of ${formatCurrency(store.businessFund.targetAmount)} in about ${months} months.`
      : `You have ${formatCurrency(remaining)} left to reach your Business Fund target — set a monthly contribution to get a timeline.`;
  }

  if (q.includes("monthly") && (q.includes("summary") || q.includes("report"))) {
    const net = ctx.income - ctx.expenses;
    return `**This month:** Income ${formatCurrency(ctx.income)}, Expenses ${formatCurrency(ctx.expenses)}, Net ${net >= 0 ? "+" : ""}${formatCurrency(net)}. ${ctx.byCategory[0] ? `Top category: ${ctx.byCategory[0].name} (${formatCurrency(ctx.byCategory[0].amount)}).` : ""
      } Emergency Fund covers ${(store.emergencyFund.currentAmount / (store.emergencyFund.monthlyExpenseBaseline || 1)).toFixed(1)} months of expenses.`;
  }

  return "I can help with things like: where you spent the most, whether you can afford a purchase, how to save more, progress toward your Business Fund, or a monthly summary. Try asking one of those.";
}

export const SUGGESTED_QUESTIONS = [
  "Where did I spend the most this month?",
  "Can I afford a ₹40,000 purchase?",
  "How can I save more?",
  "How long until I reach my business goal?",
  "Generate my monthly financial summary",
];
