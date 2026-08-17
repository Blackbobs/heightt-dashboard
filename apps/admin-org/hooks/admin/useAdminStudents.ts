import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, adminQueryKeys } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";

export function useAdminStudents(params?: {
  page?: number;
  limit?: number;
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

export function useAdminStudentPromotions(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.students.promotions(id),
    queryFn: () => adminApi.getStudentPromotions(id),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminStudentDashboard() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.students.dashboard,
    queryFn: () => adminApi.getStudentDashboard(),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminDashboard(params?: { institutionId?: string }) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: adminQueryKeys.students.adminDashboard(params),
    queryFn: () => adminApi.getAdminDashboard(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
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
