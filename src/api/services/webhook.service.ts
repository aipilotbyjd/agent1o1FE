import axiosClient from '../http/axios.config';
import type { TWebhook, TWebhookLog } from '../../types/webhook.type';

export const webhookService = {
	// Webhooks
	list: (workspaceId: string) =>
		axiosClient.get<{ data: TWebhook[] }>(`/workspaces/${workspaceId}/webhooks`),

	get: (workspaceId: string, webhookId: string) =>
		axiosClient.get<{ data: TWebhook }>(`/workspaces/${workspaceId}/webhooks/${webhookId}`),

	create: (workspaceId: string, data: Partial<TWebhook>) =>
		axiosClient.post<{ data: TWebhook }>(`/workspaces/${workspaceId}/webhooks`, data),

	update: (workspaceId: string, webhookId: string, data: Partial<TWebhook>) =>
		axiosClient.put<{ data: TWebhook }>(
			`/workspaces/${workspaceId}/webhooks/${webhookId}`,
			data,
		),

	delete: (workspaceId: string, webhookId: string) =>
		axiosClient.delete(`/workspaces/${workspaceId}/webhooks/${webhookId}`),

	activate: (workspaceId: string, webhookId: string) =>
		axiosClient.post(`/workspaces/${workspaceId}/webhooks/${webhookId}/activate`),

	deactivate: (workspaceId: string, webhookId: string) =>
		axiosClient.post(`/workspaces/${workspaceId}/webhooks/${webhookId}/deactivate`),

	test: (workspaceId: string, webhookId: string, data: any) =>
		axiosClient.post(`/workspaces/${workspaceId}/webhooks/${webhookId}/test`, data),

	// Webhook Logs
	listLogs: (workspaceId: string, webhookId: string) =>
		axiosClient.get<{ data: TWebhookLog[] }>(
			`/workspaces/${workspaceId}/webhooks/${webhookId}/logs`,
		),

	getLog: (workspaceId: string, webhookId: string, logId: string) =>
		axiosClient.get<{ data: TWebhookLog }>(
			`/workspaces/${workspaceId}/webhooks/${webhookId}/logs/${logId}`,
		),
};
