import { useMemo, useState } from "react";
import { Plus, Gem } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader } from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { useAppStore } from "@store/app-store";
import { formatCurrency, formatPercent } from "@utils/currency";
import { InvestmentFormDialog } from "../components/InvestmentFormDialog";

const TYPE_LABELS: Record<string, string> = {
  gold: "Gold",
  shariah_mutual_fund: "Shariah Mutual Fund",
  shariah_stock: "Shariah Stock",
  sukuk: "Sukuk",
};
const TYPE_COLORS: Record<string, string> = {
  gold: "#f59e0b",
  shariah_mutual_fund: "#16a34a",
  shariah_stock: "#0ea5e9",
  sukuk: "#8b5cf6",
};

export function InvestmentsPage() {
  const { investments } = useAppStore();
  const [formOpen, setFormOpen] = useState(false);

  const totalInvested = investments.reduce((a, i) => a + i.purchasePrice, 0);
  const totalValue = investments.reduce((a, i) => a + i.currentValue, 0);
  const totalProfit = totalValue - totalInvested;

  const allocation = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const i of investments) groups[i.type] = (groups[i.type] ?? 0) + i.currentValue;
    return Object.entries(groups).map(([type, value]) => ({ type, value }));
  }, [investments]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Halal Investments"
        description="Gold, Shariah mutual funds, Shariah stocks, and Sukuk only — never interest-based instruments."
        action={<Button onClick={() => setFormOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Investment</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>Total Invested</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold">{formatCurrency(totalInvested)}</span></CardContent></Card>
        <Card><CardHeader><CardTitle>Current Value</CardTitle></CardHeader><CardContent><span className="text-2xl font-semibold">{formatCurrency(totalValue)}</span></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Profit</CardTitle></CardHeader>
          <CardContent>
            <span className={`text-2xl font-semibold ${totalProfit >= 0 ? "text-success" : "text-danger"}`}>
              {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">({formatPercent((totalProfit / totalInvested) * 100)})</span>
          </CardContent>
        </Card>
      </div>

      {investments.length === 0 ? (
        <Card><CardContent className="p-6"><EmptyState icon={Gem} title="No investments yet" description="Add your first halal investment to start tracking allocation and growth." actionLabel="Add Investment" onAction={() => setFormOpen(true)} /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Allocation</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} dataKey="value" nameKey="type" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {allocation.map((a) => <Cell key={a.type} fill={TYPE_COLORS[a.type]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {investments.map((inv) => {
                const profit = inv.currentValue - inv.purchasePrice;
                const profitPct = (profit / inv.purchasePrice) * 100;
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{inv.name}</p>
                        <Badge variant="gold">{TYPE_LABELS[inv.type]}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Bought {new Date(inv.purchaseDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        {inv.units ? ` · ${inv.units} units` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(inv.currentValue)}</p>
                      <p className={`text-xs ${profit >= 0 ? "text-success" : "text-danger"}`}>
                        {profit >= 0 ? "+" : ""}{formatCurrency(profit)} ({formatPercent(profitPct)})
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      <InvestmentFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
