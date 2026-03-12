import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import type { HeatRiskLevel } from "@shared/schema";
import { getHealthGuidance } from "@/lib/heat-utils";

interface HealthGuidanceProps {
  riskLevel: HeatRiskLevel;
}

export function HealthGuidance({ riskLevel }: HealthGuidanceProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const guidance = getHealthGuidance(riskLevel);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden" data-testid="card-health-guidance">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary" data-testid="icon-health" />
          </div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide" data-testid="heading-health-guidance">
            Health & Safety Guidance
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden h-7 w-7 p-0"
          data-testid="button-toggle-guidance"
          aria-label={isExpanded ? "Collapse guidance" : "Expand guidance"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <ul className="p-5 space-y-2.5" data-testid="list-guidance">
          {guidance.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm text-foreground"
              data-testid={`item-guidance-${index}`}
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
