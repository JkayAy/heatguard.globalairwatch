import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ThermometerSun } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      setError(error.message.includes("verify your email") 
        ? "Please verify your email before logging in. Check your inbox for the verification link."
        : "Invalid email or password. Please try again.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <ThermometerSun className="h-12 w-12 text-primary" data-testid="icon-logo" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold" data-testid="text-page-title">
              Heat Risk Alert
            </CardTitle>
            <CardDescription data-testid="text-page-subtitle">
              Sign in to access your personalized heat safety dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 rounded-md bg-destructive/10 border border-destructive/20 flex gap-2" data-testid="error-message">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="hover:text-foreground underline-offset-4 hover:underline"
              data-testid="link-home"
            >
              Back to Home
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLocation("/forgot-password")}
              className="hover:text-foreground underline-offset-4 hover:underline"
              data-testid="link-forgot-password"
            >
              Forgot password?
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLocation("/signup")}
              className="hover:text-foreground underline-offset-4 hover:underline"
              data-testid="link-signup"
            >
              Create an account
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
