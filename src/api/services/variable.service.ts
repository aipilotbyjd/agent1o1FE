import axiosClient from '../http/axios.config';
import { VariableEndpoints } from '../http/endpoints';
import { buildQueryParams } from '../utils/query.helper';
import type { TApiResponse } from '@/types/api.type';
import type {
	IVariable,
	ICreateVariableDto,
	IUpdateVariableDto,
	IResolvedVariable,
	IVariableFilters,
} from '@/types/variable.type';

export const VariableService = {
	list: async (workspaceId: string, filters?: IVariableFilters): Promise<IVariable[]> => {
		const params = filters ? `?${buildQueryParams(filters)}` : '';
		const { data } = await axiosClient.get<TApiResponse<IVariable[]>>(
			`${VariableEndpoints.LIST(workspaceId)}${params}`,
		);
		return data.data;
	},

	detail: async (workspaceId: string, id: string): Promise<IVariable> => {
		const { data } = await axiosClient.get<TApiResponse<IVariable>>(
			VariableEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	create: async (workspaceId: string, dto: ICreateVariableDto): Promise<IVariable> => {
		const { data } = await axiosClient.post<TApiResponse<IVariable>>(
			VariableEndpoints.CREATE(workspaceId),
			dto,
		);
		return data.data;
	},

	update: async (workspaceId: string, id: string, dto: IUpdateVariableDto): Promise<IVariable> => {
		const { data } = await axiosClient.put<TApiResponse<IVariable>>(
			VariableEndpoints.UPDATE(workspaceId, id),
			dto,
		);
		return data.data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.delete(VariableEndpoints.DELETE(workspaceId, id));
	},

	resolve: async (workspaceId: string, name: string): Promise<IResolvedVariable> => {
		const { data } = await axiosClient.get<TApiResponse<IResolvedVariable>>(
			`${VariableEndpoints.RESOLVE(workspaceId)}?name=${encodeURIComponent(name)}`,
		);
		return data.data;
	},
};

