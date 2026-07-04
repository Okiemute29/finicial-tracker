import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../component/buttons/button";
import PasswordInput from "../../component/input/passwordinput";
import Text from "../../component/typography/typography";
import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import routes from "../../constants/routes";
import { authService } from "../../services/auth/auth.service";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordFormValues) {
    setSubmitting(true);
    try {
      await authService.updatePassword(values.password);
      Success("Password updated.");
      navigate(routes.dashboard, { replace: true });
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <Text size="2xl" className="font-bold text-slate-950">Set a new password</Text>
        <Text size="sm" className="mt-1 text-slate-500">Choose a new password for your account.</Text>
        <div className="mt-6 space-y-4">
          <PasswordInput label="New Password" placeholder="New password" error={errors.password?.message} {...register("password")} />
          <PasswordInput label="Confirm Password" placeholder="Confirm new password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <Button fullWidth type="submit" loading={submitting}>Update password</Button>
        </div>
      </form>
    </div>
  );
}
