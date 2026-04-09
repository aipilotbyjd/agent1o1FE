import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
		queryKey: queryKeys.workflows.detail(id),
		queryFn: () => WorkflowService.fetchById(workspaceId, id),
		enabled: !!workspaceId && !!id,
	});

export const useCreateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: TCreateWorkflowDto) => WorkflowService.create(workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
		},
	});
};

export const useUpdateWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateWorkflowDto }) =>
			WorkflowService.update(workspaceId, id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
		},
	});
};

export const useDeleteWorkflow = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
		},
	});
};
