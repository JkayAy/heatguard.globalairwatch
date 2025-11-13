import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import type { Location, SavedLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SaveLocationButtonProps {
  location: Location;
}

export function SaveLocationButton({ location }: SaveLocationButtonProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: savedLocations } = useQuery<SavedLocation[]>({
    queryKey: ['/api/saved-locations'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", '/api/saved-locations', {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country || null,
        admin1: location.admin1 || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
      toast({
        title: "Location Saved",
        description: `${location.name} has been added to your saved locations`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive",
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/saved-locations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-locations'] });
      toast({
        title: "Location Removed",
        description: `${location.name} has been removed from saved locations`,
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

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast({
            title: "Sign In Required",
            description: "Please sign in to save locations",
          });
        }}
        data-testid="button-save-location-unauthenticated"
      >
        <BookmarkPlus className="h-4 w-4 mr-2" />
        Save Location
      </Button>
    );
  }

  // Match by both name and coordinates for reliability
  const isSaved = savedLocations?.some(
    (saved) =>
      saved.name === location.name &&
      Math.abs(saved.latitude - location.latitude) < 0.0001 &&
      Math.abs(saved.longitude - location.longitude) < 0.0001
  );

  const savedLocation = savedLocations?.find(
    (saved) =>
      saved.name === location.name &&
      Math.abs(saved.latitude - location.latitude) < 0.0001 &&
      Math.abs(saved.longitude - location.longitude) < 0.0001
  );

  if (isSaved && savedLocation) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => unsaveMutation.mutate(savedLocation.id)}
        disabled={unsaveMutation.isPending}
        data-testid="button-unsave-location"
      >
        <BookmarkCheck className="h-4 w-4 mr-2" />
        Saved
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => saveMutation.mutate()}
      disabled={saveMutation.isPending}
      data-testid="button-save-location"
    >
      <BookmarkPlus className="h-4 w-4 mr-2" />
      Save Location
    </Button>
  );
}
