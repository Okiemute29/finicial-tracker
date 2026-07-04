import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import Button from "../../component/buttons/button";
import AuthGeneralInput from "../../component/input/authinput";
import Text from "../../component/typography/typography";
import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import routes from "../../constants/routes";
import { authService } from "../../services/auth/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}${routes.resetPassword}`;
      await authService.requestPasswordReset(values.email, redirectTo);
      Success("If that email has an account, a reset link is on its way.");
      setSent(true);
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Could not send reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <Text size="2xl" className="font-bold text-slate-950">Forgot password</Text>
        <Text size="sm" className="mt-1 text-slate-500">Enter your email and we&apos;ll send you a reset link.</Text>
        <div className="mt-6 space-y-4">
          <AuthGeneralInput label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} disabled={sent} {...register("email")} />
          <Button fullWidth type="submit" loading={submitting} disabled={sent}>Send reset link</Button>
        </div>
        <Text size="sm" className="mt-5 text-center text-slate-500">
          Remembered it?{" "}
          <Link to={routes.signin} className="font-semibold text-teal-700 hover:text-teal-800">Back to sign in</Link>
        </Text>
      </form>
    </div>
  );
}
