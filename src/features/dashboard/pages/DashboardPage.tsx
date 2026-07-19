import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Wallet, TrendingDown, TrendingUp, PiggyBank, ShieldCheck, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { StatCard } from "@components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";
import { useAppStore } from "@store/app-store";
import { useFinancialMetrics } from "@hooks/useFinancialMetrics";
import { formatCurrency, formatSignedCurrency } from "@utils/currency";

const CHART_COLORS = ["#16a34a", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#6b7280"];

export function DashboardPage() {
  const { accounts, transactions, goals, emergencyFund, businessFund, categories, loans, emis } = useAppStore();
  const metrics = useFinancialMetrics();

  const netWorth = accounts.reduce((a, acc) => a + acc.currentBalance, 0) - loans.reduce((a, l) => a + l.outstandingBalance, 0);

  const trendData = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (3 - i));
    const key = d.toISOString().slice(0, 7);
    const monthTx = transactions.filter((t) => t.date.slice(0, 7) === key);
    return {
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      income: monthTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0),
      expenses: monthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0),
    };
  });

  const upcomingEmis = emis.filter((e) => !e.isPaid).slice(0, 3);
  const recentTx = transactions.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Your financial picture at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Monthly Income" value={formatCurrency(metrics.monthlyIncome)} icon={TrendingUp}
          delta={{ value: `${metrics.incomeDelta >= 0 ? "+" : ""}${metrics.incomeDelta.toFixed(0)}% vs last month`, positive: metrics.incomeDelta >= 0 }} />
        <StatCard label="Monthly Expenses" value={formatCurrency(metrics.monthlyExpenses)} icon={TrendingDown} accent="danger"
          delta={{ value: `${metrics.expenseDelta >= 0 ? "+" : ""}${metrics.expenseDelta.toFixed(0)}% vs last month`, positive: metrics.expenseDelta <= 0 }} />
        <StatCard label="Net Worth" value={formatCurrency(netWorth)} icon={Wallet} />
        <StatCard label="Savings Rate" value={`${metrics.savingsRate.toFixed(0)}%`} icon={PiggyBank} accent="gold" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Income vs expenses over the last 4 months</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2.5} dot={false} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>This month by category</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {metrics.expenseByCategory.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No expenses yet this month</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.expenseByCategory}
                    dataKey="amount"
                    nameKey="category.name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {metrics.expenseByCategory.map((entry, i) => (
                      <Cell key={entry.category.id} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Emergency Fund</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">{formatCurrency(emergencyFund.currentAmount)}</span>
              <span className="text-xs text-muted-foreground">of {formatCurrency(emergencyFund.targetAmount)}</span>
            </div>
            <Progress value={(emergencyFund.currentAmount / emergencyFund.targetAmount) * 100} />
            <span className="text-xs text-muted-foreground">
              Covers {(emergencyFund.currentAmount / emergencyFund.monthlyExpenseBaseline).toFixed(1)} months of expenses
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-gold" /> Business Fund</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">{formatCurrency(businessFund.currentAmount)}</span>
              <span className="text-xs text-muted-foreground">of {formatCurrency(businessFund.targetAmount)}</span>
            </div>
            <Progress value={(businessFund.currentAmount / businessFund.targetAmount) * 100} indicatorClassName="bg-gold" />
            <span className="text-xs text-muted-foreground">+{formatCurrency(businessFund.monthlyContribution)}/month</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-2">
            <span className="text-4xl font-bold text-primary">{metrics.healthScore.score}</span>
            <Badge variant={metrics.healthScore.score >= 70 ? "success" : metrics.healthScore.score >= 40 ? "warning" : "danger"}>
              {metrics.healthScore.score >= 70 ? "Healthy" : metrics.healthScore.score >= 40 ? "Needs attention" : "At risk"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
            </div>
            <Link to="/expenses" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {recentTx.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.type === "income" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                      {t.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cat?.name ?? t.note ?? "Transaction"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${t.type === "income" ? "text-success" : "text-foreground"}`}>
                    {formatSignedCurrency(t.type === "income" ? t.amount : -t.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bills</CardTitle>
            <CardDescription>EMIs due soon</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcomingEmis.length === 0 && <p className="text-sm text-muted-foreground">All caught up — nothing due.</p>}
            {upcomingEmis.map((e) => {
              const loan = loans.find((l) => l.id === e.loanId);
              return (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{loan?.name}</p>
                    <p className="text-xs text-muted-foreground">Due {new Date(e.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(e.amount)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium">{g.name}</p>
              <p className="mb-2 text-xs text-muted-foreground">
                {formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}
              </p>
              <Progress value={(g.currentAmount / g.targetAmount) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
