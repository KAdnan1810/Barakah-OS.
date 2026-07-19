import { CalendarClock, CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

export function LoansPage() {
  const { loans, emis, markEmiPaid } = useAppStore();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Loans & EMI Tracker" description="Interest-free financing tracked distinctly from conventional debt." />

      <div className="flex flex-col gap-4">
        {loans.map((loan) => {
          const loanEmis = emis.filter((e) => e.loanId === loan.id).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
          const paidPct = ((loan.principal - loan.outstandingBalance) / loan.principal) * 100;
          return (
            <Card key={loan.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" /> {loan.name}
                  </CardTitle>
                  <CardDescription>
                    {loan.tenureMonths}-month tenure · started {new Date(loan.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </CardDescription>
                </div>
                <Badge variant={loan.isInterestFree ? "success" : "danger"}>
                  {loan.isInterestFree ? "Interest-free (Qard Hasan)" : "Interest-bearing"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span>Outstanding: <strong>{formatCurrency(loan.outstandingBalance)}</strong></span>
                  <span className="text-muted-foreground">of {formatCurrency(loan.principal)}</span>
                </div>
                <Progress value={paidPct} />

                <div className="flex flex-col gap-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">EMI Schedule</p>
                  {loanEmis.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div className="flex items-center gap-2">
                        {e.isPaid ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm">
                          Due {new Date(e.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatCurrency(e.amount)}</span>
                        {!e.isPaid && (
                          <Button size="sm" variant="outline" onClick={() => markEmiPaid(e.id)}>Mark paid</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
