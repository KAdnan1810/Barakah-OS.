import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { useFinancialMetrics } from "@hooks/useFinancialMetrics";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

export function BudgetPage() {
  const { budgetVsActual } = useFinancialMetrics();
  const { updateBudget } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalBudget = budgetVsActual.reduce((a, b) => a + b.budget.limitAmount, 0);
  const totalSpent = budgetVsActual.reduce((a, b) => a + b.spent, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Budget" description="Monthly, category-level budgets — see what's left before you overspend." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Budget</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold">{formatCurrency(totalBudget)}</span></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Spent So Far</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold">{formatCurrency(totalSpent)}</span></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Remaining</CardTitle></CardHeader>
          <CardContent>
            <span className={`text-2xl font-semibold ${totalBudget - totalSpent < 0 ? "text-danger" : ""}`}>
              {formatCurrency(totalBudget - totalSpent)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {budgetVsActual.map((b) => (
          <Card key={b.budget.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{b.category?.name}</span>
                  {b.percentUsed > 100 && (
                    <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" /> Overspent</Badge>
                  )}
                  {b.percentUsed > 80 && b.percentUsed <= 100 && <Badge variant="warning">Close to limit</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {formatCurrency(b.spent)} of{" "}
                  {editingId === b.budget.id ? (
                    <Input
                      autoFocus
                      type="number"
                      defaultValue={b.budget.limitAmount}
                      className="h-7 w-24 px-2 text-xs"
                      onBlur={(e) => {
                        updateBudget(b.budget.id, Number(e.target.value) || b.budget.limitAmount);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                    />
                  ) : (
                    <button className="font-medium text-foreground underline-offset-2 hover:underline" onClick={() => setEditingId(b.budget.id)}>
                      {formatCurrency(b.budget.limitAmount)}
                    </button>
                  )}
                </div>
              </div>
              <Progress value={b.percentUsed} indicatorClassName={b.percentUsed > 100 ? "bg-danger" : b.percentUsed > 80 ? "bg-warning" : "bg-primary"} />
              <span className="text-xs text-muted-foreground">
                {b.remaining >= 0 ? `${formatCurrency(b.remaining)} remaining` : `${formatCurrency(Math.abs(b.remaining))} over budget`}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
