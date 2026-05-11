import { apiGet } from '@/lib/api/client';
import type { DashboardOverview, TodayDetail } from '@/features/dashboard/types';

export function getDashboardOverview() {
  return apiGet<DashboardOverview>('dashboard/overview');
}

export function getDashboardToday() {
  return apiGet<TodayDetail>('dashboard/today');
}
