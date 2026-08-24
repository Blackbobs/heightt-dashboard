// src/hooks/platform/usePlatformAdminPermissions.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformAllPermissions() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.permissions.all,
    queryFn: () => platformApi.getAllPermissions(),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePlatformAdminPermissions(adminId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.adminPermissions.one(adminId),
    queryFn: () => platformApi.getAdminWithPermissions(adminId),
    enabled: !!token && !!adminId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignAdminWithPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      adminType: string;
      institutionId?: string;
      facultyId?: string;
      departmentId?: string;
      organizationId?: string;
      academicSessionId?: string;
      permissions?: string[];
    }) => platformApi.assignAdminWithPermissions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.administrators.all,
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.users.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.permissions.all,
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.adminPermissions.all,
      });
    },
  });
}

export function useUpdateAdminPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      adminId,
      data,
    }: {
      adminId: string;
      data: { permissions: string[]; action: "ADD" | "REMOVE" | "SET" };
    }) => platformApi.updateAdminPermissions(adminId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.adminPermissions.one(variables.adminId),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.administrators.all,
      });
    },
  });
}
