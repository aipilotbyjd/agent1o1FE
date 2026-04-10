import axiosClient from '../http/axios.config';
import { FolderEndpoints } from '../http/endpoints';
import type { TApiResponse } from '@/types/api.type';
import type { IFolder, ICreateFolderDto, IUpdateFolderDto } from '@/types/folder.type';

export const FolderService = {
	fetchAll: async (workspaceId: string): Promise<IFolder[]> => {
		const { data } = await axiosClient.get<TApiResponse<IFolder[]>>(
			FolderEndpoints.LIST(workspaceId),
		);
		return data.data;
	},

	fetchById: async (workspaceId: string, id: string): Promise<IFolder> => {
		const { data } = await axiosClient.get<TApiResponse<IFolder>>(
			FolderEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: ICreateFolderDto): Promise<IFolder> => {
		const { data } = await axiosClient.post<TApiResponse<IFolder>>(
			FolderEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, id: string, payload: IUpdateFolderDto): Promise<IFolder> => {
		const { data } = await axiosClient.put<TApiResponse<IFolder>>(
			FolderEndpoints.UPDATE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.delete(FolderEndpoints.DELETE(workspaceId, id));
	},
};
