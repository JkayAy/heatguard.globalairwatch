import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/clerk-react";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

// Extract the Clerk domain from the publishable key
// Production keys with custom domains need explicit domain configuration
const getClerkDomain = (publishableKey: string) => {
  if (publishableKey.startsWith('pk_live_')) {
    // For production keys, extract the domain from the key format
    // pk_live_[instance_id].[domain] or use default clerk domain
    return undefined; // Let Clerk auto-detect, or fall back to accounts.clerk.com
  }
  return undefined; // Use default for development
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider 
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
