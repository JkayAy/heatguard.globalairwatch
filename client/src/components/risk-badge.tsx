import { AlertTriangle, Flame, ShieldAlert, AlertOctagon, Skull } from "lucide-react";
import type { HeatRiskLevel } from "@shared/schema";
import { getRiskLevelLabel, getRiskLevelColor } from "@/lib/heat-utils";

interface RiskBadgeProps {
  level: HeatRiskLevel;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const colors = getRiskLevelColor(level);
  const label = getRiskLevelLabel(level);

  const Icon = {
    normal: ShieldAlert,
    caution: AlertTriangle,
    extreme_caution: Flame,
    danger: AlertOctagon,
    extreme_danger: Skull,
  }[level];

  const sizeClasses = {
    sm: "px-3 py-1 text-sm gap-1.5",
    md: "px-6 py-2 text-xl md:text-2xl gap-2",
    lg: "px-8 py-3 text-2xl md:text-3xl gap-3",
  }[size];

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ${colors.bg} ${colors.text} ${sizeClasses}`}
      data-testid={`badge-risk-${level}`}
    >
      <Icon className={iconSizeClasses} />
      <span>{label}</span>
    </div>
  );
}
