import { useMemo, useState } from "react";
import { Plus, Search, Download, Trash2 } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";
import { ExpenseFormDialog } from "../components/ExpenseFormDialog";

export function ExpensesPage() {
  const { transactions, categories, accounts, deleteTransaction } = useAppStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const expenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .filter((t) => !categoryFilter || t.categoryId === categoryFilter)
        .filter((t) => {
          if (!search) return true;
          const cat = categories.find((c) => c.id === t.categoryId);
          return (
            cat?.name.toLowerCase().includes(search.toLowerCase()) ||
            t.note?.toLowerCase().includes(search.toLowerCase())
          );
        }),
    [transactions, categoryFilter, search, categories]
  );

  const exportCSV = () => {
    const header = "Date,Category,Account,Amount,Payment Method,Note\n";
    const rows = expenses
      .map((t) => {
        const cat = categories.find((c) => c.id === t.categoryId)?.name ?? "";
        const acc = accounts.find((a) => a.id === t.accountId)?.name ?? "";
        return `${t.date},${cat},${acc},${t.amount},${t.paymentMethod ?? ""},"${t.note ?? ""}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expense Tracker"
        description="Log, categorize, and search every expense."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => setFormOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search expenses…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="sm:w-56" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Search}
                title="No expenses found"
                description="Try a different search or category, or log your first expense."
                actionLabel="Add Expense"
                onAction={() => setFormOpen(true)}
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {expenses.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const acc = accounts.find((a) => a.id === t.accountId);
                return (
                  <div key={t.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: `${cat?.color}1a`, color: cat?.color }}
                      >
                        {cat?.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{cat?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {acc?.name}
                          {t.note ? ` · ${t.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {t.paymentMethod && <Badge variant="outline" className="capitalize">{t.paymentMethod.replace("_", " ")}</Badge>}
                      <span className="text-sm font-semibold">{formatCurrency(t.amount)}</span>
                      <Button size="icon" variant="ghost" onClick={() => deleteTransaction(t.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
