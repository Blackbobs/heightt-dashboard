import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useAdminAnnouncements(params?: {
  organizationId?: string;
  page?: number;
  limit?: number;
  isPublished?: boolean;
  type?: string;
  priority?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.announcements.all(params),
    queryFn: () => adminApi.getAnnouncements(params),
    // Announcements are organization-scoped; never fire with a missing/bogus id.
    enabled: !!token && !!params?.organizationId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminAnnouncement(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.announcements.one(id),
    queryFn: () => adminApi.getAnnouncement(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.announcements.all(),
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.announcements.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.announcements.one(variables.id),
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.announcements.all(),
      });
    },
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.publishAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.announcements.all(),
      });
    },
  });
}
