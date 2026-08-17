import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformFinanceOverview(params?: {
  institutionId?: string;
  organizationId?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.overview(params),
    queryFn: () => platformApi.getFinanceOverview(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.transactions(params),
    queryFn: () => platformApi.getTransactions(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function usePlatformDues(params?: {
  organizationId?: string;
  page?: number;
  limit?: number;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.dues(params),
    queryFn: () => platformApi.getDues(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000,
  });
}

export function usePlatformReceipts(params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.receipts(params),
    queryFn: () => platformApi.getReceipts(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
