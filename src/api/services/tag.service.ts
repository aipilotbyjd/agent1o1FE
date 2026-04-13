import axiosClient from '../http/axios.config';
import { TagEndpoints } from '../http/endpoints';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/types/api.type';
import type { ITag, ICreateTagDto, IUpdateTagDto, ITagWorkflowsDto } from '@/types/tag.type';

export const TagService = {
	fetchAll: async (workspaceId: string, params?: TListParams): Promise<TPaginatedResponse<ITag>> => {
		const { data } = await axiosClient.get<TPaginatedResponse<ITag>>(
			TagEndpoints.LIST(workspaceId),
			{ params },
		);
		return data;
	},

	fetchById: async (workspaceId: string, id: string): Promise<ITag> => {
		const { data } = await axiosClient.get<TApiResponse<ITag>>(
			TagEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: ICreateTagDto): Promise<ITag> => {
		const { data } = await axiosClient.post<TApiResponse<ITag>>(
			TagEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, id: string, payload: IUpdateTagDto): Promise<ITag> => {
		const { data } = await axiosClient.put<TApiResponse<ITag>>(
			TagEndpoints.UPDATE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.delete(TagEndpoints.DELETE(workspaceId, id));
	},

	attachWorkflows: async (
		workspaceId: string,
		tagId: string,
		payload: ITagWorkflowsDto,
	): Promise<ITag> => {
		const { data } = await axiosClient.post<TApiResponse<ITag>>(
			TagEndpoints.ATTACH_WORKFLOWS(workspaceId, tagId),
			payload,
		);
		return data.data;
	},

	detachWorkflows: async (
		workspaceId: string,
		tagId: string,
		payload: ITagWorkflowsDto,
	): Promise<ITag> => {
		const { data } = await axiosClient.delete<TApiResponse<ITag>>(
			TagEndpoints.DETACH_WORKFLOWS(workspaceId, tagId),
			{ data: payload },
		);
		return data.data;
	},
};
