import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card.tsx";
import { Rocket } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-teal-50 to-coral-50 dark:from-violet-950 dark:via-teal-950 dark:to-coral-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-aurora opacity-30 animate-pulse" />
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-white/20 shadow-2xl animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">
            Ads Analytics Platform
          </CardTitle>
          <CardDescription className="text-base">
            Welcome back! Sign in to your analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="email-address"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                {...register("email")}
                error={errors.email?.message}
                className="h-12 bg-white/80 dark:bg-slate-800/80 border-2 border-violet-200 dark:border-violet-800 focus:border-violet-500 dark:focus:border-violet-400 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                error={errors.password?.message}
                className="h-12 bg-white/80 dark:bg-slate-800/80 border-2 border-violet-200 dark:border-violet-800 focus:border-violet-500 dark:focus:border-violet-400 rounded-lg"
                placeholder="password"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
