import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi, Department } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformDepartments(params?: {
  institutionId?: string;
  facultyId?: string;
  page?: number;
  limit?: number;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.departments.all(params),
    queryFn: async () => {
      if (!params?.facultyId) return [] as Department[];
      const arr = await platformApi.getDepartments(params.facultyId);
      if (params?.page || params?.limit) {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
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

export function usePlatformDepartment(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.departments.one(id),
    queryFn: () => platformApi.getDepartment(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Department>) =>
      platformApi.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.departments.all(),
      });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      platformApi.updateDepartment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.departments.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.departments.one(variables.id),
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.departments.all(),
      });
    },
  });
}
