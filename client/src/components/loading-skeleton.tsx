import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SearchSkeleton() {
  return <Skeleton className="h-14 w-full rounded-xl" data-testid="skeleton-search" />;
}

export function WeatherCardSkeleton() {
  return (
    <Card className="p-6 md:p-8 rounded-2xl" data-testid="skeleton-weather-card">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="h-24 w-40 mx-auto" />

        <Skeleton className="h-12 w-64 mx-auto rounded-full" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function HourlyForecastSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto snap-x pb-2" data-testid="skeleton-hourly-forecast">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="flex-shrink-0 w-24 md:w-28 p-4 rounded-lg snap-start">
          <div className="space-y-2 flex flex-col items-center">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function HealthGuidanceSkeleton() {
  return (
    <Card className="p-6 md:p-8 rounded-xl" data-testid="skeleton-health-guidance">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </Card>
  );
}
