import axiosClient from '../http/axios.config';
import { WorkspaceEndpoints } from '../http/endpoints';
import type {
	TWorkspace,
	TWorkspaceDetail,
	TCreateWorkspaceDto,
	TUpdateWorkspaceDto,
} from '@/types/workspace.type';
import type { TApiResponse } from '@/types/api.type';

export const WorkspaceService = {
	// GET /workspaces — returns { data: TWorkspace[] }
	fetchAll: async (): Promise<TWorkspace[]> => {
		const { data } = await axiosClient.get<TApiResponse<TWorkspace[]>>(WorkspaceEndpoints.LIST);
		return data.data;
	},

	// POST /workspaces — returns { data: TWorkspace }
	create: async (payload: TCreateWorkspaceDto): Promise<TWorkspace> => {
		const { data } = await axiosClient.post<TApiResponse<TWorkspace>>(
			WorkspaceEndpoints.CREATE,
			payload,
		);
		return data.data;
	},

	// GET /workspaces/{id} — returns { data: TWorkspaceDetail }
	fetchById: async (id: string): Promise<TWorkspaceDetail> => {
		const { data } = await axiosClient.get<TApiResponse<TWorkspaceDetail>>(
			WorkspaceEndpoints.DETAIL(id),
		);
		return data.data;
	},

	// PUT /workspaces/{id}
	update: async (id: string, payload: TUpdateWorkspaceDto): Promise<TWorkspaceDetail> => {
		const { data } = await axiosClient.put<TApiResponse<TWorkspaceDetail>>(
			WorkspaceEndpoints.UPDATE(id),
			payload,
		);
		return data.data;
	},

	// DELETE /workspaces/{id} — 204 No Content
	delete: async (id: string): Promise<void> => {
		await axiosClient.delete(WorkspaceEndpoints.DELETE(id));
	},
};
