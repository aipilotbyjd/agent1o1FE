import axiosClient from '../http/axios.config';
import { TemplateEndpoints } from '../http/endpoints';
import { buildQueryParams } from '../utils/query.helper';
import type { TApiResponse } from '@/types/api.type';
import type {
	ITemplate,
	ITemplateDetail,
	ITemplateFilters,
	TTemplateCategory,
} from '@/types/template.type';

export const TemplateService = {
	list: async (filters?: ITemplateFilters): Promise<ITemplate[]> => {
		const params = filters ? `?${buildQueryParams(filters)}` : '';
		const { data } = await axiosClient.get<TApiResponse<ITemplate[]>>(
			`${TemplateEndpoints.LIST}${params}`,
		);
		return data.data;
	},

	featured: async (): Promise<ITemplate[]> => {
		const { data } = await axiosClient.get<TApiResponse<ITemplate[]>>(
			TemplateEndpoints.FEATURED,
		);
		return data.data;
	},

	categories: async (): Promise<TTemplateCategory[]> => {
		const { data } = await axiosClient.get<TApiResponse<TTemplateCategory[]>>(
			TemplateEndpoints.CATEGORIES,
		);
		return data.data;
	},

	detail: async (id: string): Promise<ITemplateDetail> => {
		const { data } = await axiosClient.get<TApiResponse<ITemplateDetail>>(
			TemplateEndpoints.DETAIL(id),
		);
		return data.data;
	},

	trackView: async (id: string): Promise<void> => {
		await axiosClient.post(TemplateEndpoints.VIEW(id));
	},

	use: async (
		workspaceId: string,
		templateId: string,
		workflowName?: string,
	): Promise<{ workflow_id: string }> => {
		const { data } = await axiosClient.post<TApiResponse<{ workflow_id: string }>>(
			TemplateEndpoints.USE(workspaceId, templateId),
			workflowName ? { workflow_name: workflowName } : undefined,
		);
		return data.data;
	},
};

