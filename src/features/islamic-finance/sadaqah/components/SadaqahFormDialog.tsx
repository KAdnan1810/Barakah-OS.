import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useAppStore } from "@store/app-store";

const schema = z.object({
  amount: z.coerce.number().positive(),
  recipient: z.string().optional(),
  date: z.string().min(1),
  note: z.string().optional(),
  isRamadan: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function SadaqahFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addSadaqah } = useAppStore();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = (values: FormValues) => {
    addSadaqah({ ...values, isRamadan: Boolean(values.isRamadan) });
    toast.success("Sadaqah logged — may it be accepted");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Log Sadaqah</DialogTitle>
        <DialogDescription>Track your voluntary charity.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input id="amount" type="number" {...register("amount")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipient">Recipient (optional)</Label>
          <Input id="recipient" placeholder="e.g. Local orphanage" {...register("recipient")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isRamadan")} className="h-4 w-4 rounded border-border" />
          This was a Ramadan donation
        </label>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
