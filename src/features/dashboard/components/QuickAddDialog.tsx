import { useState } from "react";
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
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  categoryId: z.string().min(1, "Choose a category"),
  accountId: z.string().min(1, "Choose an account"),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function QuickAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { accounts, categories, addTransaction } = useAppStore();
  const [type, setType] = useState<"expense" | "income">("expense");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "expense" } });

  const relevantCategories = categories.filter((c) => c.kind === type);

  const onSubmit = (values: FormValues) => {
    addTransaction({
      accountId: values.accountId,
      categoryId: values.categoryId,
      type: values.type,
      amount: values.amount,
      currency: "INR",
      date: new Date().toISOString().slice(0, 10),
      note: values.note,
      isRecurring: false,
    });
    toast.success(values.type === "expense" ? "Expense logged" : "Income logged");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Quick add</DialogTitle>
        <DialogDescription>Log an expense or income in a few seconds.</DialogDescription>
      </DialogHeader>

      <div className="mb-4 flex gap-1 rounded-xl bg-secondary/60 p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
              type === t ? "bg-card shadow-subtle" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" value={type} {...register("type")} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register("amount")} />
          {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" {...register("categoryId")}>
              <option value="">Select…</option>
              {relevantCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accountId">Account</Label>
            <Select id="accountId" {...register("accountId")}>
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
            {errors.accountId && <p className="text-xs text-danger">{errors.accountId.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" placeholder="e.g. Weekly groceries" {...register("note")} />
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
