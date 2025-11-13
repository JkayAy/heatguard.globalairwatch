import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "./useAuth";
import type { UserPreferences, InsertUserPreferences } from "@shared/schema";

export function usePreferences() {
  const { isAuthenticated } = useAuth();

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
    retry: false,
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<InsertUserPreferences>) => {
      return await apiRequest("/api/preferences", {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
