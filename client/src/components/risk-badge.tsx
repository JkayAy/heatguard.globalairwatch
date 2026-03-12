import { CheckCircle2, AlertTriangle, Flame, AlertOctagon, Zap } from "lucide-react";
import type { HeatRiskLevel } from "@shared/schema";
import { getRiskLevelLabel } from "@/lib/heat-utils";

interface RiskBadgeProps {
  level: HeatRiskLevel;
  size?: "sm" | "md" | "lg";
}

const riskConfig: Record<HeatRiskLevel, { icon: typeof CheckCircle2; bg: string; text: string; ring: string }> = {
  normal: {
    icon: CheckCircle2,
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  caution: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  extreme_caution: {
    icon: Flame,
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-400",
    ring: "ring-orange-500/20",
  },
  danger: {
    icon: AlertOctagon,
    bg: "bg-red-500/10 dark:bg-red-500/15",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-500/20",
  },
  extreme_danger: {
    icon: Zap,
    bg: "bg-violet-500/10 dark:bg-violet-500/15",
    text: "text-violet-700 dark:text-violet-400",
    ring: "ring-violet-500/20 animate-pulse-ring",
  },
};

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const { icon: Icon, bg, text, ring } = riskConfig[level];
  const label = getRiskLevelLabel(level);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5 rounded-md",
    md: "px-4 py-2 text-sm gap-2 rounded-lg",
    lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
  }[size];

  const iconSize = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wider ring-1 ${bg} ${text} ${ring} ${sizeClasses}`}
      data-testid={`badge-risk-${level}`}
    >
      <Icon className={iconSize} />
      {label}
    </span>
  );
}
