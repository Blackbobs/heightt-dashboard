import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, AcademicSession, CreateAcademicSessionDto } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformAcademicSessions(institutionId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.academicSessions.all(institutionId),
    queryFn: () => platformApi.getAcademicSessions(institutionId),
    enabled: !!token && !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAcademicSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAcademicSessionDto) =>
      platformApi.createAcademicSession(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.academicSessions.all(
          variables.institutionId || "",
        ),
      });
    },
  });
}

export function useUpdateAcademicSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AcademicSession>;
    }) => platformApi.updateAcademicSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["platform", "academic-sessions"],
      });
    },
  });
}

export function useDeleteAcademicSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteAcademicSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platform", "academic-sessions"],
      });
    },
  });
}
