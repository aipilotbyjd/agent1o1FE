import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { WebhookService } from '../services/webhook.service';
import { queryKeys } from '../utils/query.helper';
import type { TWebhook } from '@/types/webhook.type';

// ── Queries ──────────────────────────────────────────────

export const useFetchWebhooks = (workspaceId: string) =>
	useQuery({
		queryKey: queryKeys.webhooks.all(workspaceId),
		queryFn: () => WebhookService.list(workspaceId),
		enabled: !!workspaceId,
	});

export const useFetchWebhook = (workspaceId: string, webhookId: string) =>
	useQuery({
		queryKey: queryKeys.webhooks.detail(workspaceId, webhookId),
		queryFn: () => WebhookService.detail(workspaceId, webhookId),
		enabled: !!workspaceId && !!webhookId,
	});

export const useFetchWebhookLogs = (workspaceId: string, webhookId: string) =>
	useQuery({
		queryKey: queryKeys.webhooks.logs(workspaceId, webhookId),
		queryFn: () => WebhookService.listLogs(workspaceId, webhookId),
		enabled: !!workspaceId && !!webhookId,
	});

// ── Mutations ────────────────────────────────────────────

export const useCreateWebhook = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Partial<TWebhook>) => WebhookService.create(workspaceId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.webhooks.all(workspaceId) });
			toast.success('Webhook created!');
		},
		onError: () => toast.error('Failed to create webhook'),
	});
};

export const useUpdateWebhook = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<TWebhook> }) =>
			WebhookService.update(workspaceId, id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.webhooks.all(workspaceId) });
		},
		onError: () => toast.error('Failed to update webhook'),
	});
};

export const useDeleteWebhook = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WebhookService.delete(workspaceId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.webhooks.all(workspaceId) });
			toast.success('Webhook deleted!');
		},
		onError: () => toast.error('Failed to delete webhook'),
	});
};

export const useActivateWebhook = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WebhookService.activate(workspaceId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.webhooks.all(workspaceId) });
			toast.success('Webhook activated!');
		},
		onError: () => toast.error('Failed to activate webhook'),
	});
};

export const useDeactivateWebhook = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WebhookService.deactivate(workspaceId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.webhooks.all(workspaceId) });
			toast.success('Webhook deactivated!');
		},
		onError: () => toast.error('Failed to deactivate webhook'),
	});
};

export const useTestWebhook = (workspaceId: string) =>
	useMutation({
		mutationFn: ({ id, data }: { id: string; data: unknown }) =>
			WebhookService.test(workspaceId, id, data),
		onError: () => toast.error('Failed to test webhook'),
	});
