import { Card } from "@/components/ui/card";
import { Wind, AlertCircle } from "lucide-react";
import type { AirQuality, HeatRiskLevel } from "@shared/schema";

interface AirQualityCardProps {
  airQuality: AirQuality;
  heatRiskLevel?: HeatRiskLevel;
}

const aqiLevelConfig = {
  good: {
    label: "Good",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  moderate: {
    label: "Moderate",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  unhealthy_sensitive: {
    label: "Unhealthy for Sensitive",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  unhealthy: {
    label: "Unhealthy",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  very_unhealthy: {
    label: "Very Unhealthy",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  hazardous: {
    label: "Hazardous",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
};

function getCombinedHeatAqiWarning(heatRisk: HeatRiskLevel, aqiLevel: string): string | null {
  const isHighHeat = ["extreme_caution", "danger", "extreme_danger"].includes(heatRisk);
  const isPoorAir = ["unhealthy_sensitive", "unhealthy", "very_unhealthy", "hazardous"].includes(aqiLevel);
  
  if (isHighHeat && isPoorAir) {
    return "High heat combined with poor air quality creates heightened health risks. Limit outdoor activities and stay indoors in air-conditioned spaces.";
  }
  
  if (isHighHeat && aqiLevel === "moderate") {
    return "Heat stress can be amplified by moderate air quality. Sensitive individuals should take extra precautions.";
  }
  
  if (isPoorAir) {
    return "Poor air quality can increase heat-related health impacts. Stay hydrated and minimize outdoor exertion.";
  }
  
  return null;
}

export function AirQualityCard({ airQuality, heatRiskLevel }: AirQualityCardProps) {
  const config = aqiLevelConfig[airQuality.level];
  const combinedWarning = heatRiskLevel ? getCombinedHeatAqiWarning(heatRiskLevel, airQuality.level) : null;

  return (
    <Card className="p-6 md:p-8 rounded-xl" data-testid="card-air-quality">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Wind className="h-6 w-6 text-primary" data-testid="icon-air-quality" />
          <h2 className="text-lg md:text-xl font-semibold text-foreground" data-testid="heading-air-quality">
            Air Quality
          </h2>
        </div>

        <div className={`flex items-baseline gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground" data-testid="text-aqi-value">
                {airQuality.aqi}
              </span>
              <span className="text-sm text-muted-foreground">AQI</span>
            </div>
            <div className={`text-sm font-semibold ${config.color}`} data-testid="text-aqi-level">
              {config.label}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 text-right">
            <div className="text-sm">
              <span className="text-foreground font-medium" data-testid="text-pm25-value">{airQuality.pm25.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs ml-1">PM2.5</span>
            </div>
            <div className="text-sm">
              <span className="text-foreground font-medium" data-testid="text-pm10-value">{airQuality.pm10.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs ml-1">PM10</span>
            </div>
          </div>
        </div>

        {combinedWarning && (
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" data-testid="alert-combined-warning">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              {combinedWarning}
            </p>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            Air quality can significantly affect how heat impacts your health. Poor air quality makes it harder to breathe during heat exposure.
          </p>
        </div>
      </div>
    </Card>
  );
}
