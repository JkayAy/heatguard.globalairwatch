import { Button } from "@/components/ui/button";
import { Search, MapPin, Thermometer } from "lucide-react";

interface HeroSectionProps {
  onSearchClick?: () => void;
  onLocationClick?: () => void;
}

export function HeroSection({ onSearchClick, onLocationClick }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-background border-b">
      <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border">
            <Thermometer className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              NOAA-Based Heat Risk Monitoring
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Heat Risk Early-Warning System
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Monitor real-time heat conditions with 7-day forecasts and evidence-based safety guidance.
              Stay informed about dangerous heat exposure in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Button
              size="lg"
              onClick={onSearchClick}
              className="gap-2 min-w-[180px]"
              data-testid="button-hero-search"
            >
              <Search className="h-4 w-4" />
              Search Location
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onLocationClick}
              className="gap-2 min-w-[180px]"
              data-testid="button-hero-location"
            >
              <MapPin className="h-4 w-4" />
              Use My Location
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
            <div className="space-y-1" data-testid="stat-7day">
              <div className="text-2xl font-semibold text-foreground">7-Day Forecast</div>
              <div className="text-sm text-muted-foreground">Extended heat risk outlook</div>
            </div>
            <div className="space-y-1" data-testid="stat-realtime">
              <div className="text-2xl font-semibold text-foreground">Real-Time Data</div>
              <div className="text-sm text-muted-foreground">Current heat index</div>
            </div>
            <div className="space-y-1" data-testid="stat-personalized">
              <div className="text-2xl font-semibold text-foreground">Air Quality</div>
              <div className="text-sm text-muted-foreground">Combined health impact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
