import { useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";
import { IncomeFormDialog } from "../components/IncomeFormDialog";

export function IncomePage() {
  const { transactions, categories, accounts } = useAppStore();
  const [formOpen, setFormOpen] = useState(false);

  const incomeTx = transactions.filter((t) => t.type === "income").sort((a, b) => (a.date < b.date ? 1 : -1));

  const bySource = useMemo(() => {
    const incomeCats = categories.filter((c) => c.kind === "income");
    return incomeCats
      .map((c) => ({ category: c, total: incomeTx.filter((t) => t.categoryId === c.id).reduce((a, t) => a + t.amount, 0) }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [categories, incomeTx]);

  const totalIncome = incomeTx.reduce((a, t) => a + t.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Income"
        description="All your income, across every source."
        action={<Button onClick={() => setFormOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Income</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader><CardTitle>Total Logged</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold">{formatCurrency(totalIncome)}</span></CardContent>
        </Card>
        {bySource.slice(0, 2).map((s) => (
          <Card key={s.category.id}>
            <CardHeader><CardTitle>{s.category.name}</CardTitle></CardHeader>
            <CardContent><span className="text-2xl font-semibold">{formatCurrency(s.total)}</span></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {incomeTx.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Wallet} title="No income logged yet" description="Add your salary, business, or freelance income to see it here." actionLabel="Add Income" onAction={() => setFormOpen(true)} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {incomeTx.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const acc = accounts.find((a) => a.id === t.accountId);
                return (
                  <div key={t.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{cat?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {acc?.name}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-success">+{formatCurrency(t.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <IncomeFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
