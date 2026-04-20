import axiosClient from '../http/axios.config';
import { WebhookEndpoints } from '../http/endpoints';
import type { TApiResponse } from '@/types/api.type';
import type { TWebhook, TWebhookLog } from '@/types/webhook.type';

export const WebhookService = {
	// ── Webhooks ─────────────────────────────────────────
	list: async (workspaceId: string): Promise<TWebhook[]> => {
		const { data } = await axiosClient.get<TApiResponse<TWebhook[]>>(
			WebhookEndpoints.LIST(workspaceId),
		);
		return data.data;
	},

	detail: async (workspaceId: string, webhookId: string): Promise<TWebhook> => {
		const { data } = await axiosClient.get<TApiResponse<TWebhook>>(
			WebhookEndpoints.DETAIL(workspaceId, webhookId),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: Partial<TWebhook>): Promise<TWebhook> => {
		const { data } = await axiosClient.post<TApiResponse<TWebhook>>(
			WebhookEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, webhookId: string, payload: Partial<TWebhook>): Promise<TWebhook> => {
		const { data } = await axiosClient.put<TApiResponse<TWebhook>>(
			WebhookEndpoints.UPDATE(workspaceId, webhookId),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, webhookId: string): Promise<void> => {
		await axiosClient.delete(WebhookEndpoints.DELETE(workspaceId, webhookId));
	},

	activate: async (workspaceId: string, webhookId: string): Promise<void> => {
		await axiosClient.post(WebhookEndpoints.ACTIVATE(workspaceId, webhookId));
	},

	deactivate: async (workspaceId: string, webhookId: string): Promise<void> => {
		await axiosClient.post(WebhookEndpoints.DEACTIVATE(workspaceId, webhookId));
	},

	test: async (workspaceId: string, webhookId: string, payload: unknown): Promise<void> => {
		await axiosClient.post(WebhookEndpoints.TEST(workspaceId, webhookId), payload);
	},

	// ── Logs ─────────────────────────────────────────────
	listLogs: async (workspaceId: string, webhookId: string): Promise<TWebhookLog[]> => {
		const { data } = await axiosClient.get<TApiResponse<TWebhookLog[]>>(
			WebhookEndpoints.LOGS(workspaceId, webhookId),
		);
		return data.data;
	},

	getLog: async (workspaceId: string, webhookId: string, logId: string): Promise<TWebhookLog> => {
		const { data } = await axiosClient.get<TApiResponse<TWebhookLog>>(
			WebhookEndpoints.LOG_DETAIL(workspaceId, webhookId, logId),
		);
		return data.data;
	},
};
