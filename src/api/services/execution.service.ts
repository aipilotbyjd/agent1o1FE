import axiosClient from '../http/axios.config';
import { ExecutionEndpoints } from '../http/endpoints';
import type {
	TExecution,
	TExecutionDetail,
	TExecutionLog,
} from '@/types/execution.type';
import type { TApiResponse, TListParams } from '@/types/api.type';

export const ExecutionService = {
	// GET /workspaces/{id}/executions
	fetchAll: async (workspaceId: string, params?: TListParams): Promise<TExecution[]> => {
		const { data } = await axiosClient.get<TApiResponse<TExecution[]>>(
			ExecutionEndpoints.LIST(workspaceId),
			{ params },
		);
		return data.data;
	},

	// GET /workspaces/{id}/executions/{id}
	fetchById: async (workspaceId: string, id: string): Promise<TExecutionDetail> => {
		const { data } = await axiosClient.get<TApiResponse<TExecutionDetail>>(
			ExecutionEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	// GET /workspaces/{id}/executions/{id}/logs
	fetchLogs: async (workspaceId: string, id: string): Promise<TExecutionLog[]> => {
		const { data } = await axiosClient.get<TApiResponse<TExecutionLog[]>>(
			ExecutionEndpoints.LOGS(workspaceId, id),
		);
		return data.data;
	},

	// POST /workspaces/{id}/executions/{id}/cancel
	cancel: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.post(ExecutionEndpoints.CANCEL(workspaceId, id));
	},

	// POST /workspaces/{id}/executions/{id}/retry
	retry: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.post(ExecutionEndpoints.RETRY(workspaceId, id));
	},
};
