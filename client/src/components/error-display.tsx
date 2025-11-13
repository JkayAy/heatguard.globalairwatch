import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ title, message, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="p-8 rounded-xl max-w-md mx-auto" data-testid="card-error">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" data-testid="icon-error" />
        <h2 className="text-lg font-semibold text-foreground" data-testid="text-error-title">
          {title}
        </h2>
        <p className="text-base text-muted-foreground" data-testid="text-error-message">
          {message}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="mt-6 h-12 px-6 gap-2"
            data-testid="button-retry"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}
