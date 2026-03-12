import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import { useToast } from "@/hooks/use-toast";

export function SettingsDialog() {
  const { isAuthenticated } = useAuth();
  const { preferences, updatePreferences, isUpdating, isLoading } = usePreferences();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const isDisabled = isUpdating || isLoading;

  const handleTemperatureUnitChange = async (value: string) => {
    try {
      await updatePreferences({ temperatureUnit: value as "C" | "F" });
      setHasChanges(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update temperature unit",
        variant: "destructive",
      });
    }
  };

  const handleEmailAlertsToggle = async (checked: boolean) => {
    // If enabling, validate email first
    if (checked && !preferences?.alertEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address before enabling alerts",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePreferences({ emailAlertsEnabled: checked });
      setHasChanges(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email alerts",
        variant: "destructive",
      });
    }
  };

  const handleAlertEmailChange = async (email: string) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePreferences({ alertEmail: email });
      setHasChanges(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert email",
        variant: "destructive",
      });
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges) {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully",
      });
      setHasChanges(false);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-settings"
          aria-label="Open settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your preferences and alert settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Temperature Unit */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Temperature Unit</Label>
            <RadioGroup
              value={preferences?.temperatureUnit || "C"}
              onValueChange={handleTemperatureUnitChange}
              disabled={isDisabled}
              data-testid="radio-temperature-unit"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="celsius" data-testid="radio-celsius" />
                <Label htmlFor="celsius" className="font-normal cursor-pointer">
                  Celsius (°C)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="F" id="fahrenheit" data-testid="radio-fahrenheit" />
                <Label htmlFor="fahrenheit" className="font-normal cursor-pointer">
                  Fahrenheit (°F)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Email Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Email Alerts</Label>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Email notifications for heat risk warnings are under development. Check back soon.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
