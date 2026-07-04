import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../component/buttons/button";
import AuthGeneralInput from "../../component/input/authinput";
import PasswordInput from "../../component/input/passwordinput";
import Text from "../../component/typography/typography";
import { Error as ErrorToast } from "../../component/toastify/toastify";
import routes from "../../constants/routes";
import { authService } from "../../services/auth/auth.service";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      await authService.signInWithPassword(values.email, values.password);
      navigate(routes.dashboard, { replace: true });
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <Text size="2xl" className="font-bold text-slate-950">Sign in</Text>
        <Text size="sm" className="mt-1 text-slate-500">Sign in with your Robert Wealth account.</Text>
        <div className="mt-6 space-y-4">
          <AuthGeneralInput label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
          <div>
            <PasswordInput placeholder="Password" error={errors.password?.message} {...register("password")} />
            <Link to={routes.forgotPassword} className="mt-1.5 block text-right">
              <Text size="xs" className="font-medium text-teal-700 hover:text-teal-800">Forgot password?</Text>
            </Link>
          </div>
          <Button fullWidth type="submit" loading={submitting}>Sign in</Button>
        </div>
        <Text size="sm" className="mt-5 text-center text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to={routes.signup} className="font-semibold text-teal-700 hover:text-teal-800">Sign up</Link>
        </Text>
      </form>
    </div>
  );
}
