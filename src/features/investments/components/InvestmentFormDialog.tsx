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
  type: z.enum(["gold", "shariah_mutual_fund", "shariah_stock", "sukuk"]),
  name: z.string().min(1, "Enter a name"),
  purchasePrice: z.coerce.number().positive(),
  currentValue: z.coerce.number().positive(),
  units: z.coerce.number().optional(),
  purchaseDate: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function InvestmentFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addInvestment } = useAppStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "gold", purchaseDate: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = (values: FormValues) => {
    addInvestment({ ...values, currency: "INR" });
    toast.success("Investment added");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add halal investment</DialogTitle>
        <DialogDescription>Only Shariah-compliant instruments are supported — gold, Shariah funds, Shariah stocks, and Sukuk.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Select id="type" {...register("type")}>
            <option value="gold">Gold</option>
            <option value="shariah_mutual_fund">Shariah Mutual Fund</option>
            <option value="shariah_stock">Shariah Stock</option>
            <option value="sukuk">Sukuk</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="e.g. Tata Ethical Fund" {...register("name")} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="purchasePrice">Purchase price (₹)</Label>
            <Input id="purchasePrice" type="number" {...register("purchasePrice")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentValue">Current value (₹)</Label>
            <Input id="currentValue" type="number" {...register("currentValue")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="units">Units (optional)</Label>
            <Input id="units" type="number" step="0.0001" {...register("units")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="purchaseDate">Purchase date</Label>
            <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
          </div>
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">Add investment</Button>
        </div>
      </form>
    </Dialog>
  );
}
