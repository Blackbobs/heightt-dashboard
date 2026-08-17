import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useUserOrganizations() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.organizations.userOrgs,
    queryFn: () => adminApi.getUserOrganizations(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrganizationMembers(
  organizationId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    membershipType?: string;
    search?: string;
  },
) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.organizations.members(organizationId, params),
    queryFn: () => adminApi.getOrganizationMembers(organizationId, params),
    enabled: !!token && !!organizationId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useOrganizationStats(params?: { institutionId?: string }) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.organizations.stats(params),
    queryFn: () => adminApi.getOrganizationStats(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: any;
    }) => adminApi.addMember(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.organizations.members(
          variables.organizationId,
        ),
      });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipId, data }: { membershipId: string; data: any }) =>
      adminApi.updateMember(membershipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) => adminApi.removeMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });
}
