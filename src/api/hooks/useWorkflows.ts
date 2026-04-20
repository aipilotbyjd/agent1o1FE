import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { WorkflowService } from '../services/workflows.service';
import { queryKeys } from '../utils/query.helper';
import type { TListParams } from '@/types/api.type';
import type { TCreateWorkflowDto, TUpdateWorkflowDto } from '@/types/workflow.type';

export const useFetchWorkflows = (workspaceId: string, params?: TListParams) =>
	useQuery({
		queryKey: queryKeys.workflows.list(workspaceId, params),
		queryFn: () => WorkflowService.fetchAll(workspaceId, params),
		enabled: !!workspaceId,
		staleTime: 5 * 60 * 1000,
	});

export const useFetchWorkflowById = (workspaceId: string, id: string) =>
	useQuery({
		queryKey: queryKeys.workflows.detail(workspaceId, id),
		queryFn: () => WorkflowService.fetchById(workspaceId, id),
		enabled: !!workspaceId && !!id,
	});

export const useCreateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: TCreateWorkflowDto) => WorkflowService.create(workspaceId, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success(`Workflow "${data.name}" created!`);
		},
		onError: () => {
			toast.error('Failed to create workflow');
		},
	});
};

export const useUpdateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateWorkflowDto }) =>
			WorkflowService.update(workspaceId, id, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success(`Workflow "${data.name}" updated!`);
		},
		onError: () => {
			toast.error('Failed to update workflow');
		},
	});
};

export const useDeleteWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success('Workflow deleted!');
		},
		onError: () => {
			toast.error('Failed to delete workflow');
		},
	});
};

export const useExecuteWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.execute(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success('Workflow execution started!');
		},
		onError: () => {
			toast.error('Failed to execute workflow');
		},
	});
};

export const useActivateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.activate(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success('Workflow activated!');
		},
		onError: () => {
			toast.error('Failed to activate workflow');
		},
	});
};

export const useDeactivateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.deactivate(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success('Workflow deactivated!');
		},
		onError: () => {
			toast.error('Failed to deactivate workflow');
		},
	});
};

export const useDuplicateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.duplicate(workspaceId, id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success(`Workflow duplicated as "${data.name}"!`);
		},
		onError: () => {
			toast.error('Failed to duplicate workflow');
		},
	});
};

export const useToggleFavorite = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, is_favorite }: { id: string; is_favorite: boolean }) =>
			WorkflowService.update(workspaceId, id, { is_favorite }),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all(workspaceId) });
			toast.success(
				data.is_favorite
					? `"${data.name}" added to favorites!`
					: `"${data.name}" removed from favorites!`,
			);
		},
		onError: () => {
			toast.error('Failed to update favorite status');
		},
	});
};
