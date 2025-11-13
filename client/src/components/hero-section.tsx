import { Button } from "@/components/ui/button";
import { Search, MapPin, AlertTriangle } from "lucide-react";

interface HeroSectionProps {
  onSearchClick?: () => void;
  onLocationClick?: () => void;
}

export function HeroSection({ onSearchClick, onLocationClick }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 dark:from-orange-950 dark:via-red-950 dark:to-amber-950">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Real-time Heat Risk Monitoring
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Stay Safe in
              <span className="block text-orange-600 dark:text-orange-400">
                Extreme Heat
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get real-time heat risk alerts, 7-day forecasts, and personalized safety guidance
              to protect yourself and your loved ones from dangerous heat conditions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onSearchClick}
              className="h-14 px-8 text-base gap-2 min-w-[200px]"
              data-testid="button-hero-search"
            >
              <Search className="h-5 w-5" />
              Search Location
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onLocationClick}
              className="h-14 px-8 text-base gap-2 min-w-[200px]"
              data-testid="button-hero-location"
            >
              <MapPin className="h-5 w-5" />
              Use My Location
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="space-y-2" data-testid="stat-7day">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">7-Day</div>
              <div className="text-sm text-muted-foreground">Extended heat risk forecasts</div>
            </div>
            <div className="space-y-2" data-testid="stat-realtime">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">Real-Time</div>
              <div className="text-sm text-muted-foreground">Accurate heat index calculations</div>
            </div>
            <div className="space-y-2" data-testid="stat-personalized">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">Personalized</div>
              <div className="text-sm text-muted-foreground">Tailored safety recommendations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
