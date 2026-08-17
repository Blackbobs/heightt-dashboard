import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, AcademicLevel } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformAcademicLevels(departmentId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.academicLevels.all(departmentId),
    queryFn: () => platformApi.getAcademicLevels(departmentId),
    enabled: !!token && !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAcademicLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AcademicLevel>) =>
      platformApi.createAcademicLevel(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.academicLevels.all(
          variables.departmentId || "",
        ),
      });
    },
  });
}

export function useDeleteAcademicLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteAcademicLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platform", "academic-levels"],
      });
    },
  });
}
