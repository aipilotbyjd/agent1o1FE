import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { WorkflowService } from '../services/workflows.service';
import { WorkflowShareService } from '../services/workflow-share.service';
import { queryKeys } from '../utils/query.helper';
import type { TListParams } from '@/types/api.type';
import type { IImportWorkflowDto, IMoveWorkflowsDto } from '@/types/workflow.type';
import type { ICreateShareDto, IUpdateShareDto } from '@/types/share.type';

// ─── Workflow Shares ────────────────────────────────────────────

export const useFetchWorkflowShares = (workspaceId: string, workflowId: string) =>
	useQuery({
		queryKey: queryKeys.workflows.shares(workspaceId, workflowId),
		queryFn: () => WorkflowShareService.fetchAll(workspaceId, workflowId),
		enabled: !!workspaceId && !!workflowId,
	});

export const useCreateWorkflowShare = (workspaceId: string, workflowId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ICreateShareDto) =>
			WorkflowShareService.create(workspaceId, workflowId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.shares(workspaceId, workflowId),
			});
			toast.success('Share link created!');
		},
		onError: () => {
			toast.error('Failed to create share link');
		},
	});
};

export const useUpdateWorkflowShare = (workspaceId: string, workflowId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ shareId, data }: { shareId: string; data: IUpdateShareDto }) =>
			WorkflowShareService.update(workspaceId, workflowId, shareId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.shares(workspaceId, workflowId),
			});
			toast.success('Share link updated!');
		},
		onError: () => {
			toast.error('Failed to update share link');
		},
	});
};

export const useDeleteWorkflowShare = (workspaceId: string, workflowId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (shareId: string) =>
			WorkflowShareService.delete(workspaceId, workflowId, shareId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.shares(workspaceId, workflowId),
			});
			toast.success('Share link deleted!');
		},
		onError: () => {
			toast.error('Failed to delete share link');
		},
	});
};

// ─── Public Shares ──────────────────────────────────────────────

export const useViewPublicShare = (token: string) =>
	useQuery({
		queryKey: queryKeys.publicShares.view(token),
		queryFn: () => WorkflowShareService.viewPublic(token),
		enabled: !!token,
	});

export const useClonePublicShare = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ token, password }: { token: string; password?: string }) =>
			WorkflowShareService.clonePublic(workspaceId, token, password),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
			toast.success(`Workflow "${data.name}" cloned!`);
		},
		onError: () => {
			toast.error('Failed to clone shared workflow');
		},
	});
};

// ─── Import / Export ────────────────────────────────────────────

export const useImportWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IImportWorkflowDto) =>
			WorkflowService.importWorkflow(workspaceId, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
			toast.success(`Workflow "${data.name}" imported!`);
		},
		onError: () => {
			toast.error('Failed to import workflow');
		},
	});
};

export const useExportWorkflow = (workspaceId: string) => {
	return useMutation({
		mutationFn: (id: string) => WorkflowService.exportWorkflow(workspaceId, id),
		onSuccess: () => {
			toast.success('Workflow exported!');
		},
		onError: () => {
			toast.error('Failed to export workflow');
		},
	});
};

// ─── Per-Workflow Executions ────────────────────────────────────

export const useFetchWorkflowExecutions = (
	workspaceId: string,
	workflowId: string,
	params?: TListParams,
) =>
	useQuery({
		queryKey: queryKeys.workflows.executions(workspaceId, workflowId, params),
		queryFn: () => WorkflowService.fetchWorkflowExecutions(workspaceId, workflowId, params),
		enabled: !!workspaceId && !!workflowId,
	});

// ─── Move Workflows (between folders) ──────────────────────────

export const useMoveWorkflows = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IMoveWorkflowsDto) =>
			WorkflowService.moveWorkflows(workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
			queryClient.invalidateQueries({ queryKey: queryKeys.folders.all(workspaceId) });
			toast.success('Workflows moved!');
		},
		onError: () => {
			toast.error('Failed to move workflows');
		},
	});
};
