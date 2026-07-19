import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

export function NetWorthPage() {
  const { netWorthHistory, accounts, loans, investments } = useAppStore();

  const totalAssets = accounts.reduce((a, acc) => a + acc.currentBalance, 0) + investments.reduce((a, i) => a + i.currentValue, 0);
  const totalLiabilities = loans.reduce((a, l) => a + l.outstandingBalance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const chartData = netWorthHistory.map((s) => ({
    month: new Date(s.date).toLocaleDateString("en-IN", { month: "short" }),
    netWorth: s.netWorth,
  }));
  chartData.push({ month: "Now", netWorth });

  const firstNetWorth = netWorthHistory[0]?.netWorth ?? netWorth;
  const growth = firstNetWorth !== 0 ? ((netWorth - firstNetWorth) / Math.abs(firstNetWorth)) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Net Worth" description="Total assets minus total liabilities, tracked over time." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>Total Assets</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold text-success">{formatCurrency(totalAssets)}</span></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Liabilities</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold text-danger">{formatCurrency(totalLiabilities)}</span></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Net Worth</CardTitle></CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{formatCurrency(netWorth)}</span>
            <span className={`ml-2 text-sm ${growth >= 0 ? "text-success" : "text-danger"}`}>
              {growth >= 0 ? "+" : ""}{growth.toFixed(0)}% over 6 months
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Net Worth History</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="netWorth" stroke="#16a34a" strokeWidth={2.5} fill="url(#netWorthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
