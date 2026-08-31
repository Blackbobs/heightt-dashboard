import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, Faculty, CreateFacultyDto } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformFaculties(
  params?:
    | {
        institutionId?: string;
        page?: number;
        limit?: number;
      }
    | string,
) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.faculties.all(params),
    queryFn: async () => {
      const institutionId = typeof params === "string" ? params : params?.institutionId;
      if (!institutionId) return [] as Faculty[];
      const arr = await platformApi.getFaculties(institutionId);
      if (typeof params !== "string" && (params?.page || params?.limit)) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const start = (page - 1) * limit;
        const paginated = arr.slice(start, start + limit);
        return {
          data: paginated,
          meta: {
            page,
            limit,
            total: arr.length,
            totalPages: Math.max(1, Math.ceil(arr.length / limit)),
          },
        } as any;
      }
      return arr as any;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformFaculty(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.faculties.one(id),
    queryFn: () => platformApi.getFaculty(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacultyDto) => platformApi.createFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.faculties.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.all(),
      });
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Faculty> }) =>
      platformApi.updateFaculty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.faculties.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.faculties.one(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.all(),
      });
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.faculties.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.institutions.all(),
      });
    },
  });
}
