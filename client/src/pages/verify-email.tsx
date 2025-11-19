import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, ThermometerSun } from "lucide-react";

export default function VerifyEmailPage() {
  const [, params] = useRoute("/verify-email/:token");
  const [_, setLocation] = useLocation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!params?.token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${params.token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Failed to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [params?.token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className={`rounded-full p-4 ${
              status === "verifying" ? "bg-primary/10" :
              status === "success" ? "bg-green-500/10" :
              "bg-destructive/10"
            }`}>
              {status === "verifying" && (
                <Loader2 className="h-12 w-12 text-primary animate-spin" data-testid="icon-loading" />
              )}
              {status === "success" && (
                <CheckCircle className="h-12 w-12 text-green-500" data-testid="icon-success" />
              )}
              {status === "error" && (
                <XCircle className="h-12 w-12 text-destructive" data-testid="icon-error" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold" data-testid="text-page-title">
              {status === "verifying" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription data-testid="text-page-message">
              {message}
            </CardDescription>
          </div>
        </CardHeader>

        {status !== "verifying" && (
          <>
            <CardContent className="space-y-4">
              {status === "success" && (
                <p className="text-sm text-muted-foreground text-center">
                  Your account is now active. You can log in to start using Heat Risk Alert.
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-muted-foreground text-center">
                  The verification link may have expired or is invalid. Please try signing up again or contact support.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={() => setLocation(status === "success" ? "/login" : "/signup")}
                className="w-full"
                data-testid="button-continue"
              >
                {status === "success" ? "Go to Login" : "Back to Signup"}
              </Button>
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                data-testid="link-home"
              >
                Back to Home
              </button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
