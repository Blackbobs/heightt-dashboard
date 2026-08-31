import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformDashboardAnalytics(params?: {
  institutionId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.analytics.dashboard(params),
    queryFn: () => platformApi.getDashboardAnalytics(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformRevenueAnalytics(params?: {
  institutionId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.analytics.revenue(params),
    queryFn: () => platformApi.getRevenueAnalytics(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformGrowthAnalytics(params?: {
  institutionId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.analytics.growth(params),
    queryFn: () => platformApi.getGrowthAnalytics(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
