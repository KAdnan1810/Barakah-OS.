import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { useAppStore } from "@store/app-store";
import { useFinancialMetrics } from "@hooks/useFinancialMetrics";
import { formatCurrency, formatPercent } from "@utils/currency";

const COLORS = ["#16a34a", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#6b7280"];

export function AnalyticsPage() {
  const { transactions, investments } = useAppStore();
  const metrics = useFinancialMetrics();

  const yearlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const monthTx = transactions.filter((t) => t.date.slice(0, 7) === key);
    const income = monthTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
    const expenses = monthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
    return { month: d.toLocaleDateString("en-IN", { month: "short" }), income, expenses, net: income - expenses };
  });

  const totalInvestmentGrowth = investments.reduce((a, i) => a + (i.currentValue - i.purchasePrice), 0);
  const totalInvested = investments.reduce((a, i) => a + i.purchasePrice, 0);
  const investmentGrowthPct = totalInvested > 0 ? (totalInvestmentGrowth / totalInvested) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="Cash flow, category breakdown, and growth — the full picture." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Savings Rate</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold">{formatPercent(metrics.savingsRate)}</span></CardContent></Card>
        <Card><CardHeader><CardTitle>Financial Health</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold">{metrics.healthScore.score}/100</span></CardContent></Card>
        <Card><CardHeader><CardTitle>Investment Growth</CardTitle></CardHeader><CardContent><span className={`text-2xl font-semibold ${investmentGrowthPct >= 0 ? "text-success" : "text-danger"}`}>{formatPercent(investmentGrowthPct)}</span></CardContent></Card>
        <Card><CardHeader><CardTitle>Debt-to-Income</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold">{formatPercent(metrics.healthScore.debtToIncomeRatio * 100)}</span></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow (6 months)</CardTitle>
          <CardDescription>Net income minus expenses, month by month</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                {yearlyData.map((d, i) => <Cell key={i} fill={d.net >= 0 ? "#16a34a" : "#ef4444"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>This month's expenses, ranked</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {metrics.expenseByCategory.map((c, i) => (
            <div key={c.category.id} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm">{c.category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{formatCurrency(c.amount)}</span>
                <Badge variant="outline">{formatPercent((c.amount / metrics.monthlyExpenses) * 100)}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
