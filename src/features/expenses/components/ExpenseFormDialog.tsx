import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select } from "@components/ui/select";
import { useAppStore } from "@store/app-store";

const schema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  categoryId: z.string().min(1, "Choose a category"),
  accountId: z.string().min(1, "Choose an account"),
  date: z.string().min(1),
  paymentMethod: z.enum(["cash", "debit_card", "credit_card", "upi", "bank_transfer", "cheque", "other"]),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ExpenseFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { accounts, categories, addTransaction } = useAppStore();
  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), paymentMethod: "upi" },
  });

  const onSubmit = (values: FormValues) => {
    addTransaction({
      accountId: values.accountId,
      categoryId: values.categoryId,
      type: "expense",
      amount: values.amount,
      currency: "INR",
      date: values.date,
      note: values.note,
      paymentMethod: values.paymentMethod,
      isRecurring: false,
    });
    toast.success("Expense logged");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add expense</DialogTitle>
        <DialogDescription>Every expense you log sharpens your budgeting picture.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" {...register("categoryId")}>
              <option value="">Select…</option>
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accountId">Account</Label>
            <Select id="accountId" {...register("accountId")}>
              <option value="">Select…</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            {errors.accountId && <p className="text-xs text-danger">{errors.accountId.message}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="paymentMethod">Payment method</Label>
          <Select id="paymentMethod" {...register("paymentMethod")}>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="debit_card">Debit card</option>
            <option value="credit_card">Credit card</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" placeholder="e.g. Weekly groceries" {...register("note")} />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">Save expense</Button>
        </div>
      </form>
    </Dialog>
  );
}
