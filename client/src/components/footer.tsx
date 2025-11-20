import { Thermometer } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" data-testid="icon-footer-logo" />
              <span className="text-base font-semibold text-foreground">Heat Risk Alert</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Real-time heat risk monitoring and personalized safety guidance based on NOAA standards.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground/80" data-testid="text-disclaimer">
                This application is provided for educational, informational, and research purposes only. Not for commercial use.
              </p>
              <p className="text-muted-foreground" data-testid="text-copyright">
                © {new Date().getFullYear()} James Ayodele Kolawole. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <a
                  href="https://ayokolawole.co.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                  data-testid="link-developer-website"
                >
                  ayokolawole.co.uk
                </a>
                <span className="text-muted-foreground/40">•</span>
                <a
                  href="mailto:info@ayokolawole.co.uk"
                  className="text-foreground hover:underline"
                  data-testid="link-developer-email"
                >
                  info@ayokolawole.co.uk
                </a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-muted-foreground">
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
