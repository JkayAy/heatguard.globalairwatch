import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Wind } from "lucide-react";
import { type DailyForecast, type HeatRiskLevel } from "@shared/schema";

interface DailyForecastCardProps {
  forecast: DailyForecast;
  temperatureUnit: "C" | "F";
}

const riskColors: Record<HeatRiskLevel, string> = {
  normal: "bg-green-500 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-600",
  caution: "bg-yellow-500 hover:bg-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-600",
  extreme_caution: "bg-orange-500 hover:bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-600",
  danger: "bg-red-500 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-600",
  extreme_danger: "bg-purple-700 hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-800",
};

const riskLabels: Record<HeatRiskLevel, string> = {
  normal: "Normal",
  caution: "Caution",
  extreme_caution: "Extreme Caution",
  danger: "Danger",
  extreme_danger: "Extreme Danger",
};

function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function DailyForecastCard({ forecast, temperatureUnit }: DailyForecastCardProps) {
  const date = new Date(forecast.date);
  const dayOfWeek = format(date, "EEE");
  const monthDay = format(date, "MMM d");

  const tempMax = temperatureUnit === "F" 
    ? celsiusToFahrenheit(forecast.temperatureMax)
    : Math.round(forecast.temperatureMax);
  
  const tempMin = temperatureUnit === "F"
    ? celsiusToFahrenheit(forecast.temperatureMin)
    : Math.round(forecast.temperatureMin);

  const heatIndexMax = temperatureUnit === "F"
    ? celsiusToFahrenheit(forecast.heatIndexMax)
    : Math.round(forecast.heatIndexMax);

  const heatIndexMin = temperatureUnit === "F"
    ? celsiusToFahrenheit(forecast.heatIndexMin)
    : Math.round(forecast.heatIndexMin);

  return (
    <Card className="hover-elevate" data-testid={`card-daily-forecast-${forecast.date}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold" data-testid={`text-day-${forecast.date}`}>{dayOfWeek}</div>
            <div className="text-sm text-muted-foreground font-normal" data-testid={`text-date-${forecast.date}`}>
              {monthDay}
            </div>
          </div>
          <Badge 
            className={`${riskColors[forecast.riskLevel]} text-white`}
            data-testid={`badge-risk-${forecast.date}`}
          >
            {riskLabels[forecast.riskLevel]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-bold" data-testid={`text-temp-max-${forecast.date}`}>
              {tempMax}°
            </div>
            <div className="text-sm text-muted-foreground" data-testid={`text-temp-min-${forecast.date}`}>
              Low: {tempMin}°{temperatureUnit}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Heat Index Range</div>
            <div className="text-lg font-semibold" data-testid={`text-heat-index-max-${forecast.date}`}>
              {heatIndexMax}°{temperatureUnit}
            </div>
            <div className="text-xs text-muted-foreground" data-testid={`text-heat-index-min-${forecast.date}`}>
              Low: {heatIndexMin}°{temperatureUnit}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm" data-testid={`text-precipitation-${forecast.date}`}>
              {forecast.precipitationProbability}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm" data-testid={`text-wind-${forecast.date}`}>
              {Math.round(forecast.windSpeedMax)} km/h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
