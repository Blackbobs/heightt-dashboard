import { useEffect, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import {
  UserWithdrawalRequestDto,
  OrganizationWithdrawalRequestDto,
  PlatformWithdrawalRequestDto,
  WithdrawalFiltersDto,
  WithdrawalRejectRequestDto,
} from "@/lib/api/types";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import { useAuthStore } from "@/store/auth-store";

/**
 * Views a withdrawal changes: every withdrawal queue and the platform finance
 * overview, which carries the platform earnings balance.
 */
function invalidateWithdrawalViews(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    queryKey: platformQueryKeys.finance.withdrawals(),
  });
  queryClient.invalidateQueries({
    queryKey: platformQueryKeys.finance.overview(),
  });
}

export function usePlatformWithdrawals(params?: WithdrawalFiltersDto) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.finance.withdrawals(params),
    queryFn: () => platformApi.getWithdrawals(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    refetchInterval: (query) =>
      query.state.data?.data?.some((item) =>
        item.status === "PENDING" || item.status === "PROCESSING",
      )
        ? 30_000
        : false,
  });
}

export function usePlatformWithdrawal(id: string) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: platformQueryKeys.finance.withdrawal(id),
    queryFn: () => platformApi.getWithdrawal(id),
    enabled: !!token && !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 10_000 : false;
    },
    refetchIntervalInBackground: false,
  });

  // Refresh the queues and earnings when the payout moves on. This lives here
  // rather than in the query function, which would invalidate this same query
  // and refetch it in a loop.
  const status = query.data?.status;
  const previousStatus = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (status && previousStatus.current && previousStatus.current !== status) {
      invalidateWithdrawalViews(queryClient);
    }
    previousStatus.current = status;
  }, [status, queryClient]);

  return query;
}

export function usePlatformWithdrawalQuote(amount?: number) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["platform", "finance", "withdrawal-quote", "PLATFORM", amount],
    queryFn: () => platformApi.getWithdrawalQuote({ type: "PLATFORM", amount }),
    enabled: !!token,
    staleTime: 0,
    retry: false,
  });
}

export function useRequestUserWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserWithdrawalRequestDto) =>
      platformApi.requestUserWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
    },
  });
}

export function useRequestOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationWithdrawalRequestDto) =>
      platformApi.requestOrganizationWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
    },
  });
}

export function useRequestPlatformWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlatformWithdrawalRequestDto) =>
      platformApi.requestPlatformWithdrawal(data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.overview(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.transactions(),
      });
      queryClient.invalidateQueries({ queryKey: ["platform", "finance", "withdrawal-quote"] });
      queryClient.invalidateQueries({ queryKey: ["platform", "finance", "wallet"] });
    },
  });
}

export function useApproveUserWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.approveUserWithdrawal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
    },
  });
}

export function useRejectUserWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: WithdrawalRejectRequestDto;
    }) => platformApi.rejectUserWithdrawal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
    },
  });
}

export function useApproveOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.approveOrganizationWithdrawal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.overview(),
      });
    },
  });
}

export function useRejectOrganizationWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: WithdrawalRejectRequestDto;
    }) => platformApi.rejectOrganizationWithdrawal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.overview(),
      });
    },
  });
}

export function useApprovePlatformWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.approvePlatformWithdrawal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawals(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.finance.withdrawal(id),
      });
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.finance.overview() });
      queryClient.invalidateQueries({ queryKey: ["platform", "finance", "wallet"] });
    },
  });
}
