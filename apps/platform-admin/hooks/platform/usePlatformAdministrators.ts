import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { AdminResponseDto } from "@/lib/api/types";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformAdministrators() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.administrators.all,
    queryFn: () => platformApi.getAdministrators(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      adminType:
        | "PLATFORM_ADMIN"
        | "INSTITUTION_ADMIN"
        | "FACULTY_ADMIN"
        | "DEPARTMENT_ADMIN"
        | "ORGANIZATION_ADMIN"
        | "CLUB_ADMIN";
      institutionId?: string;
      facultyId?: string;
      departmentId?: string;
      organizationId?: string;
      academicSessionId?: string;
    }) => platformApi.assignAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.administrators.all,
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.users.all(),
      });
    },
  });
}

export function useRevokeAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: string) => platformApi.revokeAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.administrators.all,
      });
    },
  });
}
