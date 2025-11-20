import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Trash2 } from "lucide-react";
import type { SavedLocation, Location } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SavedLocationsProps {
  onLocationSelect: (location: Location) => void;
}

export function SavedLocations({ onLocationSelect }: SavedLocationsProps) {
  const { toast } = useToast();
  
  const { data: savedLocations, isLoading } = useQuery<SavedLocation[]>({
    queryKey: ['/api/saved-locations'],
    staleTime: 5 * 60 * 1000,
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/saved-locations/${id}/default`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
      toast({
        title: "Default Location Updated",
        description: "This location is now your default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update default location",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/saved-locations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
      toast({
        title: "Location Removed",
        description: "Location removed from saved list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove location",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Saved Locations</h2>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!savedLocations || savedLocations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Saved Locations</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          No saved locations yet. Search for a location and save it to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Saved Locations</h2>
      </div>
      <div className="space-y-1">
        {savedLocations.map((location) => (
          <div
            key={location.id}
            className="group flex items-center gap-2 p-2 rounded-md hover-elevate active-elevate-2 transition-colors"
            data-testid={`saved-location-${location.id}`}
          >
            <button
              onClick={() =>
                onLocationSelect({
                  name: location.name,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  country: location.country ?? "",
                  admin1: location.admin1 ?? "",
                })
              }
              className="flex-1 text-left min-w-0"
              data-testid={`button-select-location-${location.id}`}
            >
              <div className="flex items-start gap-2 min-w-0">
                {location.isDefault && (
                  <Star className="h-4 w-4 fill-primary text-primary shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{location.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {location.admin1 && `${location.admin1}, `}
                    {location.country}
                  </p>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setDefaultMutation.mutate(location.id)}
                disabled={location.isDefault || setDefaultMutation.isPending}
                data-testid={`button-set-default-${location.id}`}
                aria-label="Set as default"
              >
                <Star className={`h-3.5 w-3.5 ${location.isDefault ? 'fill-primary text-primary' : ''}`} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-location-${location.id}`}
                    aria-label="Remove location"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Location</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove "{location.name}" from your saved locations?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(location.id)}
                      data-testid={`confirm-delete-${location.id}`}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
