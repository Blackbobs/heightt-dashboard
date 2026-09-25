import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { platformQueryKeys } from "@/lib/api/platformKeys";
import type { ApprovalStatus, ReviewApprovalDto } from "@/lib/api/types";
import { useAuthStore } from "@/store/auth-store";

export function usePlatformApprovals(status: ApprovalStatus) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: platformQueryKeys.approvals.all(status),
    queryFn: () => platformApi.getApprovalRequests(status),
    enabled: Boolean(token),
  });
}

export function useReviewApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      approvalId,
      data,
    }: {
      approvalId: string;
      data: ReviewApprovalDto;
    }) => platformApi.reviewApprovalRequest(approvalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "approvals"] });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.organizations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: platformQueryKeys.administrators.all,
      });
    },
  });
}
