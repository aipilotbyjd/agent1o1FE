import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhookService } from '../services/webhook.service';
import type { TWebhook } from '@/types/webhook.type';

export const useFetchWebhooks = (workspaceId: string) => {
	return useQuery({
		queryKey: ['webhooks', workspaceId],
		queryFn: () => webhookService.list(workspaceId),
		enabled: !!workspaceId,
	});
};

export const useFetchWebhook = (workspaceId: string, webhookId: string) => {
	return useQuery({
		queryKey: ['webhooks', workspaceId, webhookId],
		queryFn: () => webhookService.get(workspaceId, webhookId),
		enabled: !!workspaceId && !!webhookId,
	});
};

export const useCreateWebhook = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<TWebhook>) => webhookService.create(workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
		},
	});
};

export const useUpdateWebhook = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<TWebhook> }) =>
			webhookService.update(workspaceId, id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
		},
	});
};

export const useDeleteWebhook = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => webhookService.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
		},
	});
};

export const useActivateWebhook = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => webhookService.activate(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
		},
	});
};

export const useDeactivateWebhook = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => webhookService.deactivate(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['webhooks', workspaceId] });
		},
	});
};

export const useTestWebhook = (workspaceId: string) => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			webhookService.test(workspaceId, id, data),
	});
};

export const useFetchWebhookLogs = (workspaceId: string, webhookId: string) => {
	return useQuery({
		queryKey: ['webhook-logs', workspaceId, webhookId],
		queryFn: () => webhookService.listLogs(workspaceId, webhookId),
		enabled: !!workspaceId && !!webhookId,
	});
};
