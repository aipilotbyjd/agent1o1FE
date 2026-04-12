import axiosClient from '../http/axios.config';
import { DashboardEndpoints } from '../http/endpoints';
import type { TApiResponse } from '@/types/api.type';
import type { IDashboardData, IQuickStats, TDashboardPeriod } from '@/types/dashboard.type';

export const DashboardService = {
	getData: async (workspaceId: string, period: TDashboardPeriod = '7d'): Promise<IDashboardData> => {
		const { data } = await axiosClient.get<TApiResponse<IDashboardData>>(
			`${DashboardEndpoints.DATA(workspaceId)}?period=${period}`,
		);
		return data.data;
	},

	getStats: async (workspaceId: string): Promise<IQuickStats> => {
		const { data } = await axiosClient.get<TApiResponse<IQuickStats>>(
			DashboardEndpoints.STATS(workspaceId),
		);
		return data.data;
	},
};

