import { useState } from "react";
import { Plus, Landmark, Wallet, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select } from "@components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog";
import { useAppStore } from "@store/app-store";
import { formatCurrency } from "@utils/currency";

const icons = { bank: Landmark, cash: Wallet, business: Briefcase, wallet: Wallet, investment: Landmark, other: Wallet };

const schema = z.object({
  name: z.string().min(1, "Enter an account name"),
  type: z.enum(["bank", "cash", "business", "wallet", "investment", "other"]),
  institution: z.string().optional(),
  currentBalance: z.coerce.number().min(0),
});
type FormValues = z.infer<typeof schema>;

export function AccountsPage() {
  const { accounts, transactions, addAccount } = useAppStore();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "bank", currentBalance: 0 },
  });

  const onSubmit = (values: FormValues) => {
    addAccount(values);
    toast.success("Account added");
    reset();
    setOpen(false);
  };

  const totalBalance = accounts.reduce((a, acc) => a + acc.currentBalance, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description={`Total across all accounts: ${formatCurrency(totalBalance)}`}
        action={<Button onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Account</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const Icon = icons[acc.type];
          const income = transactions.filter((t) => t.accountId === acc.id && t.type === "income").reduce((a, t) => a + t.amount, 0);
          const expenses = transactions.filter((t) => t.accountId === acc.id && t.type === "expense").reduce((a, t) => a + t.amount, 0);
          return (
            <Card key={acc.id}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{acc.name}</p>
                      {acc.institution && <p className="text-xs text-muted-foreground">{acc.institution}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current balance</p>
                  <p className="text-2xl font-semibold">{formatCurrency(acc.currentBalance)}</p>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-xs">
                  <span className="text-success">+{formatCurrency(income)} in</span>
                  <span className="text-danger">-{formatCurrency(expenses)} out</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Add account</DialogTitle>
          <DialogDescription>Bank, cash wallet, or business account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Account name</Label>
            <Input id="name" placeholder="e.g. ICICI Savings" {...register("name")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select id="type" {...register("type")}>
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="business">Business</option>
                <option value="wallet">Wallet</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentBalance">Opening balance (₹)</Label>
              <Input id="currentBalance" type="number" {...register("currentBalance")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="institution">Institution (optional)</Label>
            <Input id="institution" placeholder="e.g. HDFC Bank" {...register("institution")} />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add account</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
