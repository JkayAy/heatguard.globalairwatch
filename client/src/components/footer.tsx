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

        <div className="pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
            <p className="text-muted-foreground" data-testid="text-copyright">
              © {new Date().getFullYear()} Heat Risk Alert. All rights reserved.
            </p>
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
