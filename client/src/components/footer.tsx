import { Thermometer } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" data-testid="icon-footer-logo" />
              <span className="text-base font-semibold text-foreground">Heat Risk Alert</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Real-time heat risk monitoring and personalized safety guidance based on NOAA standards.
            </p>
          </div>

          <div className="w-full border-t pt-6 space-y-3">
            <p className="text-xs text-muted-foreground/80" data-testid="text-disclaimer">
              This application is provided for educational, informational, and research purposes only. Not for commercial use.
            </p>
            
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              © {new Date().getFullYear()} James Ayodele Kolawole. All rights reserved.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Designed by:{" "}
              <a
                href="https://ayokolawole.co.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
                data-testid="link-developer-website"
              >
                ayokolawole.co.uk
              </a>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-2">
              <p data-testid="text-attribution-openmeteo">
                Weather data:{" "}
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  Open-Meteo
                </a>
              </p>
              <span className="text-muted-foreground/40">•</span>
              <p data-testid="text-attribution-noaa">
                Heat index:{" "}
                <a
                  href="https://www.weather.gov/safety/heat-index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  NOAA standards
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
