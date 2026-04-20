import axiosClient from '../http/axios.config';
import { NodeTypeEndpoints } from '../http/endpoints';
import type { TApiResponse } from '@/types/api.type';
import type { INodeType, INodeCategory, INodeTypeFilters } from '@/types/nodeType.type';

export const NodeTypeService = {
	list: async (filters?: INodeTypeFilters): Promise<INodeType[]> => {
		const { data } = await axiosClient.get<TApiResponse<INodeType[]>>(
			NodeTypeEndpoints.LIST,
			{ params: filters },
		);
		return data.data;
	},

	categories: async (): Promise<INodeCategory[]> => {
		const { data } = await axiosClient.get<TApiResponse<INodeCategory[]>>(
			NodeTypeEndpoints.CATEGORIES,
		);
		return data.data;
	},

	detail: async (nodeType: string): Promise<INodeType> => {
		const { data } = await axiosClient.get<TApiResponse<INodeType>>(
			NodeTypeEndpoints.DETAIL(nodeType),
		);
		return data.data;
	},
};
