import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { getDashboardOverview, getDashboardToday } from '@/lib/api/endpoints/dashboard';

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: getDashboardOverview,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardToday() {
  return useQuery({
    queryKey: queryKeys.dashboard.today,
    queryFn: getDashboardToday,
    staleTime: 60 * 1000,
  });
}
