import { Card } from "@/components/ui/card";
import { Sun, CloudSun } from "lucide-react";
import type { HourlyForecast } from "@shared/schema";
import { formatTime } from "@/lib/heat-utils";
import { RiskBadge } from "./risk-badge";

interface HourlyForecastTimelineProps {
  hourly: HourlyForecast[];
}

export function HourlyForecastTimeline({ hourly }: HourlyForecastTimelineProps) {
  const now = new Date();
  const currentHour = now.getHours();
  
  const remainingHours = hourly.filter((hour) => {
    const hourDate = new Date(hour.time);
    return hourDate.getHours() >= currentHour && hourDate.getDate() === now.getDate();
  }).slice(0, 12);

  if (remainingHours.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg md:text-xl font-semibold text-foreground" data-testid="heading-hourly-forecast">
        Hourly Forecast
      </h2>
      <div className="flex gap-3 overflow-x-auto snap-x pb-2 scroll-smooth" data-testid="container-hourly-forecast">
        {remainingHours.map((hour, index) => {
          const Icon = hour.temperature > 25 ? Sun : CloudSun;

          return (
            <Card
              key={index}
              className="flex-shrink-0 w-24 md:w-28 p-4 rounded-lg snap-start hover-elevate"
              data-testid={`card-hour-${index}`}
            >
              <div className="space-y-2 flex flex-col items-center">
                <p className="text-sm font-medium text-muted-foreground" data-testid={`text-time-${index}`}>
                  {formatTime(hour.time)}
                </p>
                <Icon className="h-10 w-10 text-primary" data-testid={`icon-weather-${index}`} />
                <p className="text-lg font-semibold tabular-nums text-foreground" data-testid={`text-temp-${index}`}>
                  {Math.round(hour.temperature)}°C
                </p>
                <RiskBadge level={hour.riskLevel} size="sm" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
