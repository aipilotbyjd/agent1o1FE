import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboard.service';
import { queryKeys } from '../utils/query.helper';
import type { TDashboardPeriod } from '@/types/dashboard.type';

// ── Dashboard Data ────────────────────────────────────
export const useFetchDashboard = (
	workspaceId: string | null,
	period: TDashboardPeriod = '7d',
	options?: { enabled?: boolean; refetchInterval?: number },
) =>
	useQuery({
		queryKey: queryKeys.dashboard.data(workspaceId!, period),
		queryFn: () => DashboardService.getData(workspaceId!, period),
		enabled: !!workspaceId && (options?.enabled !== false),
		refetchInterval: options?.refetchInterval,
	});

// ── Quick Stats ───────────────────────────────────────
export const useFetchQuickStats = (
	workspaceId: string | null,
	options?: { enabled?: boolean; refetchInterval?: number },
) =>
	useQuery({
		queryKey: queryKeys.dashboard.stats(workspaceId!),
		queryFn: () => DashboardService.getStats(workspaceId!),
		enabled: !!workspaceId && (options?.enabled !== false),
		refetchInterval: options?.refetchInterval,
	});
