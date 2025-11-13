import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import type { HeatRiskLevel } from "@shared/schema";
import { getHealthGuidance } from "@/lib/heat-utils";

interface HealthGuidanceProps {
  riskLevel: HeatRiskLevel;
}

export function HealthGuidance({ riskLevel }: HealthGuidanceProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const guidance = getHealthGuidance(riskLevel);

  return (
    <Card className="p-6 md:p-8 rounded-xl" data-testid="card-health-guidance">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" data-testid="icon-health" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground" data-testid="heading-health-guidance">
              Health & Safety Guidance
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden"
            data-testid="button-toggle-guidance"
            aria-label={isExpanded ? "Collapse guidance" : "Expand guidance"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <ul className="space-y-3 leading-relaxed" data-testid="list-guidance">
            {guidance.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-base text-foreground"
                data-testid={`item-guidance-${index}`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
