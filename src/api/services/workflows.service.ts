import axiosClient from '../http/axios.config';
import { WorkflowEndpoints } from '../http/endpoints';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/types/api.type';
import type { TWorkflow, TCreateWorkflowDto, TUpdateWorkflowDto } from '@/types/workflow.type';

export const WorkflowService = {
	fetchAll: async (workspaceId: string, params?: TListParams): Promise<TPaginatedResponse<TWorkflow>> => {
		const { data } = await axiosClient.get<TPaginatedResponse<TWorkflow>>(
			WorkflowEndpoints.LIST(workspaceId),
			{ params },
		);
		return data;
	},

	fetchById: async (workspaceId: string, id: string): Promise<TWorkflow> => {
		const { data } = await axiosClient.get<TApiResponse<TWorkflow>>(
			WorkflowEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: TCreateWorkflowDto): Promise<TWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<TWorkflow>>(
			WorkflowEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, id: string, payload: TUpdateWorkflowDto): Promise<TWorkflow> => {
		const { data } = await axiosClient.put<TApiResponse<TWorkflow>>(
			WorkflowEndpoints.UPDATE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.delete(WorkflowEndpoints.DELETE(workspaceId, id));
	},

	execute: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.post(WorkflowEndpoints.EXECUTE(workspaceId, id));
	},

	activate: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.post(WorkflowEndpoints.ACTIVATE(workspaceId, id));
	},

	deactivate: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.post(WorkflowEndpoints.DEACTIVATE(workspaceId, id));
	},

	duplicate: async (workspaceId: string, id: string): Promise<TWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<TWorkflow>>(
			WorkflowEndpoints.DUPLICATE(workspaceId, id),
		);
		return data.data;
	},
};
