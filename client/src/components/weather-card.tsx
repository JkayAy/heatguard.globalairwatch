import { Card } from "@/components/ui/card";
import { Droplets, Thermometer, Gauge, Clock } from "lucide-react";
import type { WeatherData } from "@shared/schema";
import { formatDateTime } from "@/lib/heat-utils";
import { RiskBadge } from "./risk-badge";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";

interface WeatherCardProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { current, location, heatIndex, riskLevel } = data;
  const { format } = useTemperatureUnit();

  return (
    <Card className="p-6 md:p-8 rounded-2xl" data-testid="card-current-weather">
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="text-location-name">
            {location.name}
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-location-region">
            {location.admin1 && `${location.admin1}, `}
            {location.country}
          </p>
        </div>

        <div className="flex justify-center">
          <p className="text-6xl md:text-7xl font-bold tabular-nums text-foreground" data-testid="text-temperature">
            {format(current.temperature)}
          </p>
        </div>

        <div className="flex justify-center">
          <RiskBadge level={riskLevel} size="md" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-4 border-t">
          <div className="space-y-2" data-testid="metric-humidity">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>Humidity</span>
            </div>
            <p className="text-2xl md:text-3xl font-semibold tabular-nums text-foreground" data-testid="text-humidity">
              {Math.round(current.humidity)}%
            </p>
          </div>

          <div className="space-y-2" data-testid="metric-feels-like">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              <span>Feels Like</span>
            </div>
            <p className="text-2xl md:text-3xl font-semibold tabular-nums text-foreground" data-testid="text-apparent-temp">
              {format(current.apparentTemperature)}
            </p>
          </div>

          <div className="space-y-2" data-testid="metric-heat-index">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              <Gauge className="h-4 w-4" />
              <span>Heat Index</span>
            </div>
            <p className="text-2xl md:text-3xl font-semibold tabular-nums text-foreground" data-testid="text-heat-index">
              {format(heatIndex)}
            </p>
          </div>

          <div className="space-y-2" data-testid="metric-updated">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated</span>
            </div>
            <p className="text-sm md:text-base font-medium text-foreground" data-testid="text-updated-time">
              {formatDateTime(current.time)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
