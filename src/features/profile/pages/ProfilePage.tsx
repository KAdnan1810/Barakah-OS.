import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { useAuth } from "@features/auth/hooks/useAuth";

interface FormValues {
  fullName: string;
  email: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { fullName: user?.fullName ?? "", email: user?.email ?? "" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Your account details." />
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(() => toast.success("Profile updated"))} className="flex flex-col gap-4 sm:max-w-md">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...register("fullName")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled />
            </div>
            <Button type="submit" className="mt-1 self-start">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
