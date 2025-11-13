import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DailyForecast, type HeatRiskLevel } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RiskTrendVisualizationProps {
  dailyForecasts: DailyForecast[];
}

const riskLevelValue: Record<HeatRiskLevel, number> = {
  normal: 1,
  caution: 2,
  extreme_caution: 3,
  danger: 4,
  extreme_danger: 5,
};

const riskLevelColor: Record<HeatRiskLevel, string> = {
  normal: "#22c55e",        // green-500
  caution: "#eab308",       // yellow-500
  extreme_caution: "#f97316", // orange-500
  danger: "#ef4444",        // red-500
  extreme_danger: "#7c3aed", // purple-600
};

const riskLevelLabel: Record<HeatRiskLevel, string> = {
  normal: "Normal",
  caution: "Caution",
  extreme_caution: "Extreme Caution",
  danger: "Danger",
  extreme_danger: "Extreme Danger",
};

export function RiskTrendVisualization({ dailyForecasts }: RiskTrendVisualizationProps) {
  if (!dailyForecasts || dailyForecasts.length === 0) {
    return null;
  }

  const maxRiskValue = 5;
  const chartHeight = 120;
  const chartWidth = 100; // percentage
  const padding = 8;

  // Calculate points for the line graph
  const points = dailyForecasts.map((forecast, index) => {
    const x = (index / (dailyForecasts.length - 1)) * 100;
    const riskValue = riskLevelValue[forecast.riskLevel];
    const y = chartHeight - ((riskValue - 1) / (maxRiskValue - 1)) * (chartHeight - padding * 2) - padding;
    return { x, y, risk: forecast.riskLevel, date: forecast.date };
  });

  // Create SVG path
  const pathD = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Calculate overall trend
  const firstRisk = riskLevelValue[dailyForecasts[0].riskLevel];
  const lastRisk = riskLevelValue[dailyForecasts[dailyForecasts.length - 1].riskLevel];
  const trendDirection = lastRisk > firstRisk ? "increasing" : lastRisk < firstRisk ? "decreasing" : "stable";

  return (
    <Card data-testid="card-risk-trend">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Heat Risk Trend</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            {trendDirection === "increasing" && (
              <>
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Increasing Risk</span>
              </>
            )}
            {trendDirection === "decreasing" && (
              <>
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Decreasing Risk</span>
              </>
            )}
            {trendDirection === "stable" && (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stable</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          <svg
            width="100%"
            height={chartHeight}
            viewBox={`0 0 100 ${chartHeight}`}
            preserveAspectRatio="none"
            className="overflow-visible"
            data-testid="svg-risk-trend"
          >
            {/* Background grid lines */}
            {[1, 2, 3, 4, 5].map((level) => {
              const y = chartHeight - ((level - 1) / (maxRiskValue - 1)) * (chartHeight - padding * 2) - padding;
              return (
                <line
                  key={level}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-muted-foreground/20"
                />
              );
            })}

            {/* Gradient area under the line */}
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={riskLevelColor[points[0].risk]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={riskLevelColor[points[0].risk]} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area under the line */}
            <path
              d={`${pathD} L 100 ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#riskGradient)"
            />

            {/* The main risk line */}
            <path
              d={pathD}
              fill="none"
              stroke={riskLevelColor[points[Math.floor(points.length / 2)].risk]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={riskLevelColor[point.risk]}
                stroke="white"
                strokeWidth="1.5"
                className="hover:r-5 transition-all"
                data-testid={`point-risk-${point.date}`}
              />
            ))}
          </svg>

          {/* Day labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {dailyForecasts.map((forecast, index) => (
              <div
                key={forecast.date}
                className="flex-1 text-center"
                data-testid={`label-day-${forecast.date}`}
              >
                {index === 0 ? "Today" : format(new Date(forecast.date), "EEE")}
              </div>
            ))}
          </div>

          {/* Risk level legend */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            {Object.entries(riskLevelLabel).map(([level, label]) => (
              <div key={level} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: riskLevelColor[level as HeatRiskLevel] }}
                />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
