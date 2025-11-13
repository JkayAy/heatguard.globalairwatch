import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X, LogIn } from "lucide-react";
import { WeatherCard } from "@/components/weather-card";
import { HourlyForecastTimeline } from "@/components/hourly-forecast";
import { HealthGuidance } from "@/components/health-guidance";
import { ErrorDisplay } from "@/components/error-display";
import { SettingsDialog } from "@/components/settings-dialog";
import { SavedLocations } from "@/components/saved-locations";
import {
  WeatherCardSkeleton,
  HourlyForecastSkeleton,
  HealthGuidanceSkeleton,
} from "@/components/loading-skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Location, WeatherData } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  const { data: suggestions, isLoading: searchLoading } = useQuery<Location[]>({
    queryKey: [`/api/geocoding/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useQuery<WeatherData>({
    queryKey: [
      `/api/weather?latitude=${selectedLocation?.latitude}&longitude=${selectedLocation?.longitude}&name=${encodeURIComponent(selectedLocation?.name || "")}&country=${encodeURIComponent(selectedLocation?.country || "")}&admin1=${encodeURIComponent(selectedLocation?.admin1 || "")}`,
    ],
    enabled: !!selectedLocation,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setShowSuggestions(false);
    setLocationError(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedLocation(null);
    setLocationError(null);
    setShowSuggestions(false);
  };

  const handleUseMyLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error("Failed to get location name");
          }

          const location: Location = await response.json();
          setSelectedLocation(location);
          setSearchQuery(location.name);
        } catch (error) {
          setLocationError("Unable to determine your location name");
          setSelectedLocation({
            name: "Your Location",
            latitude,
            longitude,
          });
          setSearchQuery("Your Location");
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("Unable to retrieve your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1" />
          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <SettingsDialog />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                  aria-label="Log out"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
                aria-label="Log in"
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 md:gap-8">
          {isAuthenticated && (
            <aside className="space-y-6">
              <SavedLocations onLocationSelect={handleSelectLocation} />
            </aside>
          )}
          
          <main className="space-y-6 md:space-y-8">
            <div className="space-y-4">

          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Heat Risk Alert
            </h1>
            <p className="text-base text-muted-foreground">
              Real-time heat safety information for any location
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="h-14 text-lg pl-12 pr-12 rounded-xl"
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                    data-testid="button-clear-search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {showSuggestions && searchQuery.length >= 2 && suggestions && suggestions.length > 0 && (
                <div
                  className="absolute z-10 w-full mt-2 bg-popover border border-popover-border rounded-lg shadow-xl py-2 max-h-64 overflow-y-auto"
                  data-testid="list-suggestions"
                >
                  {suggestions.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(location)}
                      className="w-full px-4 py-3 text-left hover-elevate active-elevate-2 transition-colors"
                      data-testid={`item-suggestion-${index}`}
                    >
                      <p className="font-medium text-foreground">{location.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.admin1 && `${location.admin1}, `}
                        {location.country}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleUseMyLocation}
                variant="outline"
                className="h-14 px-6 rounded-xl gap-2 w-full md:w-auto"
                data-testid="button-use-location"
              >
                <MapPin className="h-5 w-5" />
                Use My Location
              </Button>
            </div>

            {locationError && (
              <div className="text-center text-sm text-destructive" data-testid="text-location-error">
                {locationError}
              </div>
            )}
          </div>
        </div>

        {!selectedLocation && !weatherLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Search for a city or use your location to see heat risk information
            </p>
          </div>
        )}

        {weatherLoading && (
          <div className="space-y-6 md:space-y-8">
            <WeatherCardSkeleton />
            <HourlyForecastSkeleton />
            <HealthGuidanceSkeleton />
          </div>
        )}

        {weatherError && (
          <ErrorDisplay
            title="Unable to Load Weather Data"
            message="There was an error loading the weather information. Please try again."
            onRetry={() => refetchWeather()}
          />
        )}

        {weatherData && !weatherLoading && (
          <div className="space-y-6 md:space-y-8">
            <WeatherCard data={weatherData} />
            <HourlyForecastTimeline hourly={weatherData.hourly} />
            <HealthGuidance riskLevel={weatherData.riskLevel} />
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  );
}
