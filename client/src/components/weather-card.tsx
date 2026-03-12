import { Droplets, Thermometer, Gauge, Clock } from "lucide-react";
import type { WeatherData } from "@shared/schema";
import { formatDateTime } from "@/lib/heat-utils";
import { RiskBadge } from "./risk-badge";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { SaveLocationButton } from "./save-location-button";

interface WeatherCardProps {
  data: WeatherData;
}

interface MetricProps {
  icon: typeof Droplets;
  label: string;
  value: string;
  testId: string;
  valueTestId: string;
}

function Metric({ icon: Icon, label, value, testId, valueTestId }: MetricProps) {
  return (
    <div className="space-y-1" data-testid={testId}>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-2xl md:text-3xl font-bold tabular-nums text-foreground" data-testid={valueTestId}>
        {value}
      </p>
    </div>
  );
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { current, location, heatIndex, riskLevel } = data;
  const { format } = useTemperatureUnit();

  return (
    <div
      className="rounded-2xl border bg-card shadow-md overflow-hidden animate-fade-in"
      data-testid="card-current-weather"
    >
      {/* Top gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

      <div className="p-6 md:p-8 space-y-6">
        {/* Location */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight" data-testid="text-location-name">
              {location.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-location-region">
              {[location.admin1, location.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <SaveLocationButton location={location} />
        </div>

        {/* Temperature + Risk */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-7xl md:text-8xl font-bold tabular-nums text-foreground leading-none" data-testid="text-temperature">
            {format(current.temperature)}
          </p>
          <div className="flex flex-col gap-2">
            <RiskBadge level={riskLevel} size="md" />
            <p className="text-xs text-muted-foreground">Current heat risk level</p>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t">
          <Metric icon={Droplets} label="Humidity" value={`${Math.round(current.humidity)}%`} testId="metric-humidity" valueTestId="text-humidity" />
          <Metric icon={Thermometer} label="Feels Like" value={format(current.apparentTemperature)} testId="metric-feels-like" valueTestId="text-apparent-temp" />
          <Metric icon={Gauge} label="Heat Index" value={format(heatIndex)} testId="metric-heat-index" valueTestId="text-heat-index" />
          <div className="space-y-1" data-testid="metric-updated">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug" data-testid="text-updated-time">
              {formatDateTime(current.time)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
