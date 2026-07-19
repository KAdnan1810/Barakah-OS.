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
  name: z.string().min(1, "Name your goal"),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function GoalFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addGoal } = useAppStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    addGoal({ ...values, currency: "INR", deadline: values.deadline || null });
    toast.success("Goal created");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>New goal</DialogTitle>
        <DialogDescription>Give it a target, and track your progress from anywhere.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Goal name</Label>
          <Input id="name" placeholder="e.g. Hajj Fund" {...register("name")} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetAmount">Target (₹)</Label>
            <Input id="targetAmount" type="number" {...register("targetAmount")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentAmount">Already saved (₹)</Label>
            <Input id="currentAmount" type="number" {...register("currentAmount")} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input id="deadline" type="date" {...register("deadline")} />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">Create goal</Button>
        </div>
      </form>
    </Dialog>
  );
}
