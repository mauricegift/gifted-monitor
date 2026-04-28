import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User2, Lock, LogIn } from "lucide-react";
import { AuthLayout } from "@/layouts";
import { InputWithIcon, ButtonWithLoader } from "@/components/ui";
import { loginSchema, type LoginForm } from "@/schemas";
import { useAuthStore } from "@/store";
import api from "@/config/api";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post("/auth/login", { identifier: data.identifier, password: data.password });
      setAuth(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; requiresVerification?: boolean; email?: string } } };
      if (error.response?.data?.requiresVerification) {
        toast.info("Please verify your account first");
        navigate("/verify", { state: { email: error.response.data.email, type: "signup" } });
        return;
      }
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account" icon={<LogIn size={24} />}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputWithIcon
          id="identifier"
          icon={<User2 size={18} />}
          label="Email or username"
          type="text"
          placeholder="you@example.com or yourusername"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register("identifier")}
        />
        <InputWithIcon
          id="password"
          icon={<Lock size={18} />}
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-muted hover:text-main transition-colors">
            Forgot password?
          </Link>
        </div>

        <ButtonWithLoader
          type="submit"
          loading={isSubmitting}
          initialText="Sign in"
          loadingText="Signing in..."
          className="w-full h-11 rounded-xl btn-primary text-sm"
        />
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-main font-medium hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
