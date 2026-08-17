import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  platformApi,
  Organization,
  OrganizationMember,
} from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformOrganizations(params?: {
  page?: number;
  limit?: number;
  institutionId?: string;
  status?: string;
  type?: string;
  scope?: string;
  search?: string;
  parentId?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.organizations.all(params),
    queryFn: () => platformApi.getOrganizations(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function usePlatformOrganization(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.organizations.one(id),
    queryFn: () => platformApi.getOrganization(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformOrganizationMembers(
  id: string,
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
    queryKey: platformQueryKeys.organizations.members(id, params),
    queryFn: () => platformApi.getOrganizationMembers(id, params),
    enabled: !!token && !!id,
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Organization>) =>
      platformApi.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.all(),
      });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Organization> }) =>
      platformApi.updateOrganization(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.one(variables.id),
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.all(),
      });
    },
  });
}

export function useActivateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.activateOrganization(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.one(id),
      });
    },
  });
}

export function useArchiveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.archiveOrganization(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.one(id),
      });
    },
  });
}

// ============================================
// ORGANIZATION MEMBER MUTATIONS
// ============================================

export function useAddOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: {
        userId: string;
        membershipType: string;
        status?: string;
        isPrimary?: boolean;
        sessionId?: string;
      };
    }) => platformApi.addOrganizationMember(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.members(
          variables.organizationId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.one(variables.organizationId),
      });
    },
  });
}

export function useUpdateOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: {
        status?: string;
        membershipType?: string;
        isPrimary?: boolean;
      };
    }) => platformApi.updateOrganizationMember(membershipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platform", "organizations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["platform", "organizations", "members"],
      });
    },
  });
}

export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) =>
      platformApi.removeOrganizationMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platform", "organizations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["platform", "organizations", "members"],
      });
    },
  });
}

// ============================================
// ORGANIZATION ADMIN MUTATIONS
// ============================================

export function useAssignAdminToOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      role,
    }: {
      organizationId: string;
      userId: string;
      role: string;
    }) =>
      platformApi.addOrganizationMember(organizationId, {
        userId,
        membershipType: "ADMIN",
        status: "ACTIVE",
        isPrimary: true,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.members(
          variables.organizationId,
        ),
      });
    },
  });
}

export function useRemoveAdminFromOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) =>
      platformApi.removeOrganizationMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platform", "organizations"],
      });
    },
  });
}
