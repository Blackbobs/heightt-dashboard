import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";

export function useInstitutionSessions(institutionId: string) {
  return useQuery({
    queryKey: adminQueryKeys.academicSessions(institutionId),
    queryFn: () => adminApi.getInstitutionSessions(institutionId),
    enabled: Boolean(institutionId),
  });
}

export function useInstitutionPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ institutionId, currentSessionId, notes }: { institutionId: string; currentSessionId: string; notes?: string }) => adminApi.promoteInstitution(institutionId, currentSessionId, notes),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "academic-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.auth.user });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });
}
