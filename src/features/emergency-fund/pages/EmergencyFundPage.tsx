import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

export function EmergencyFundPage() {
  const { emergencyFund, contributeEmergencyFund } = useAppStore();
  const [amount, setAmount] = useState("");

  const pct = (emergencyFund.currentAmount / emergencyFund.targetAmount) * 100;
  const monthsCovered = emergencyFund.currentAmount / emergencyFund.monthlyExpenseBaseline;
  const monthsToTarget =
    emergencyFund.targetAmount > emergencyFund.currentAmount
      ? Math.ceil((emergencyFund.targetAmount - emergencyFund.currentAmount) / (emergencyFund.monthlyExpenseBaseline * 0.2))
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Emergency Fund" description="A cash buffer for the unexpected — aim for 3–6 months of expenses." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Progress</CardTitle>
          <CardDescription>Target: {formatCurrency(emergencyFund.targetAmount)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold">{formatCurrency(emergencyFund.currentAmount)}</span>
            <span className="text-sm text-muted-foreground">{pct.toFixed(0)}% funded</span>
          </div>
          <Progress value={pct} className="h-3" />
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Months covered</p>
              <p className="text-lg font-semibold">{monthsCovered.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly baseline</p>
              <p className="text-lg font-semibold">{formatCurrency(emergencyFund.monthlyExpenseBaseline)}</p>
            </div>
            {monthsToTarget > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Est. completion</p>
                <p className="text-lg font-semibold">~{monthsToTarget} months</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Input placeholder="Amount to add" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button
              onClick={() => {
                const amt = Number(amount);
                if (amt > 0) {
                  contributeEmergencyFund(amt);
                  setAmount("");
                }
              }}
            >
              Contribute
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
