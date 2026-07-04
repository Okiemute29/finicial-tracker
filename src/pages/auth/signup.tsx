import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../component/buttons/button";
import AuthGeneralInput from "../../component/input/authinput";
import PasswordInput from "../../component/input/passwordinput";
import Text from "../../component/typography/typography";
import { Error as ErrorToast, Success } from "../../component/toastify/toastify";
import routes from "../../constants/routes";
import { authService } from "../../services/auth/auth.service";

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupFormValues) {
    setSubmitting(true);
    try {
      const session = await authService.signUpWithPassword(values.email, values.password);
      if (session) {
        navigate(routes.dashboard, { replace: true });
        return;
      }
      Success("Account created. Check your email to confirm before signing in.");
      navigate(routes.signin, { replace: true });
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <Text size="2xl" className="font-bold text-slate-950">Create an account</Text>
        <Text size="sm" className="mt-1 text-slate-500">Set up your Robert Wealth account.</Text>
        <div className="mt-6 space-y-4">
          <AuthGeneralInput label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
          <PasswordInput label="Password" placeholder="Password" error={errors.password?.message} {...register("password")} />
          <PasswordInput label="Confirm Password" placeholder="Confirm password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <Button fullWidth type="submit" loading={submitting}>Sign up</Button>
        </div>
        <Text size="sm" className="mt-5 text-center text-slate-500">
          Already have an account?{" "}
          <Link to={routes.signin} className="font-semibold text-teal-700 hover:text-teal-800">Sign in</Link>
        </Text>
      </form>
    </div>
  );
}
