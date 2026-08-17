import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, Announcement } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformAnnouncements(params?: {
  organizationId?: string;
  page?: number;
  limit?: number;
  isPublished?: boolean;
  type?: string;
  priority?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.announcements.all(params),
    queryFn: () => platformApi.getAnnouncements(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePlatformAnnouncement(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.announcements.one(id),
    queryFn: () => platformApi.getAnnouncement(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      title: string;
      content: string;
      type: string;
      priority: string;
      expiresAt?: string;
    }) => platformApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.announcements.all(),
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      platformApi.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.announcements.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.announcements.one(variables.id),
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.announcements.all(),
      });
    },
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.publishAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.announcements.all(),
      });
    },
  });
}
