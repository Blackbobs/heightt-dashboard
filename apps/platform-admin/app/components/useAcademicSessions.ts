// src/hooks/platform/useAcademicSessions.ts

import { useQuery } from "@tanstack/react-query";
import { axiosConfig } from "@/utils/axios-config";
import { useAuthStore } from "@/store/auth-store";

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  isCurrent: boolean;
  institutionId: string;
  stats?: {
    organizationCount: number;
    studentCount: number;
    dueCount: number;
    promotionCount: number;
    membershipCount: number;
  };
}

export function useAcademicSessions(institutionId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["academic-sessions", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      try {
        const response = await axiosConfig.get(
          `/institutions/${institutionId}/academic-sessions`,
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch academic sessions:", error);
        return [];
      }
    },
    enabled: isAuthenticated && !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}
