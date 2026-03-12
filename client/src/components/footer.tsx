import { Thermometer } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Thermometer className="h-4 w-4 text-primary" data-testid="icon-footer-logo" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground block leading-none">HeatGuard</span>
              <span className="text-xs text-muted-foreground">Global Air Watch</span>
            </div>
          </div>

          {/* Attribution */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span data-testid="text-attribution-openmeteo">
              Weather:{" "}
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-foreground transition-colors">
                Open-Meteo
              </a>
            </span>
            <span className="opacity-30">·</span>
            <span data-testid="text-attribution-noaa">
              Heat index:{" "}
              <a href="https://www.weather.gov/safety/heat-index" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-foreground transition-colors">
                NOAA
              </a>
            </span>
            <span className="opacity-30">·</span>
            <a href="https://ayokolawole.co.uk/" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-foreground transition-colors" data-testid="link-developer-website">
              ayokolawole.co.uk
            </a>
          </div>

          {/* Copyright + disclaimer */}
          <div className="text-center md:text-right space-y-0.5">
            <p className="text-xs text-muted-foreground" data-testid="text-copyright">
              © {new Date().getFullYear()} James Ayodele Kolawole
            </p>
            <p className="text-xs text-muted-foreground/60" data-testid="text-disclaimer">
              For informational purposes only
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
