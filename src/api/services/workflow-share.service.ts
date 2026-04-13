import axiosClient from '../http/axios.config';
import { WorkflowShareEndpoints } from '../http/endpoints';
import type { TApiResponse } from '@/types/api.type';
import type { TWorkflow } from '@/types/workflow.type';
import type {
	IWorkflowShare,
	ICreateShareDto,
	IUpdateShareDto,
	IPublicShareView,
} from '@/types/share.type';

export const WorkflowShareService = {
	fetchAll: async (workspaceId: string, workflowId: string): Promise<IWorkflowShare[]> => {
		const { data } = await axiosClient.get<TApiResponse<IWorkflowShare[]>>(
			WorkflowShareEndpoints.LIST(workspaceId, workflowId),
		);
		return data.data;
	},

	create: async (
		workspaceId: string,
		workflowId: string,
		payload: ICreateShareDto,
	): Promise<IWorkflowShare> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflowShare>>(
			WorkflowShareEndpoints.CREATE(workspaceId, workflowId),
			payload,
		);
		return data.data;
	},

	update: async (
		workspaceId: string,
		workflowId: string,
		shareId: string,
		payload: IUpdateShareDto,
	): Promise<IWorkflowShare> => {
		const { data } = await axiosClient.put<TApiResponse<IWorkflowShare>>(
			WorkflowShareEndpoints.UPDATE(workspaceId, workflowId, shareId),
			payload,
		);
		return data.data;
	},

	delete: async (
		workspaceId: string,
		workflowId: string,
		shareId: string,
	): Promise<void> => {
		await axiosClient.delete(
			WorkflowShareEndpoints.DELETE(workspaceId, workflowId, shareId),
		);
	},

	viewPublic: async (token: string, password?: string): Promise<IPublicShareView> => {
		const { data } = await axiosClient.get<TApiResponse<IPublicShareView>>(
			WorkflowShareEndpoints.VIEW_PUBLIC(token),
			{ params: password ? { password } : undefined },
		);
		return data.data;
	},

	clonePublic: async (
		workspaceId: string,
		token: string,
		password?: string,
	): Promise<TWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<TWorkflow>>(
			WorkflowShareEndpoints.CLONE_PUBLIC(workspaceId, token),
			password ? { password } : undefined,
		);
		return data.data;
	},
};
