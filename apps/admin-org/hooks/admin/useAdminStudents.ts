// apps/admin-org/hooks/admin/useAdminStudents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useAdminStudents(params?: {
  page?: number;
  limit?: number;
  organizationId?: string;
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
  levelId?: string;
  status?: string;
  verificationStatus?: string;
  search?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.students.all(params),
    queryFn: () => adminApi.getStudents(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminStudent(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.students.one(id),
    queryFn: () => adminApi.getStudent(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.students.all(),
      });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.students.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.students.one(variables.id),
      });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.students.all(),
      });
    },
  });
}