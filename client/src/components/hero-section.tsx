import { Button } from "@/components/ui/button";
import { Search, MapPin, Thermometer, Wind, Activity, Shield } from "lucide-react";

interface HeroSectionProps {
  onSearchClick?: () => void;
  onLocationClick?: () => void;
}

export function HeroSection({ onSearchClick, onLocationClick }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden border-b bg-background">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              NOAA-Based Heat Risk Monitoring
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Real-time heat risk,{" "}
              <span className="gradient-text">anywhere on Earth</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade heat monitoring with 7-day forecasts, air quality integration, and
              evidence-based safety guidance. Protect people before conditions become dangerous.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={onSearchClick}
              className="gap-2 min-w-[190px] h-11 shadow-sm"
              data-testid="button-hero-search"
            >
              <Search className="h-4 w-4" />
              Search a Location
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onLocationClick}
              className="gap-2 min-w-[190px] h-11"
              data-testid="button-hero-location"
            >
              <MapPin className="h-4 w-4" />
              Use My Location
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border shadow-sm mt-4">
            {[
              { icon: Activity, label: "7-Day Forecast", desc: "Extended heat risk outlook", testId: "stat-7day" },
              { icon: Thermometer, label: "Real-Time Data", desc: "Live NOAA heat index", testId: "stat-realtime" },
              { icon: Wind, label: "Air Quality", desc: "EPA AQI integration", testId: "stat-personalized" },
            ].map(({ icon: Icon, label, desc, testId }) => (
              <div key={testId} className="bg-card px-6 py-5 text-center" data-testid={testId}>
                <div className="flex justify-center mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            ))}
          </div>

          {/* Trust indicator */}
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            Data from Open-Meteo · Heat index by NOAA · No account required to view
          </p>
        </div>
      </div>
    </div>
  );
}
