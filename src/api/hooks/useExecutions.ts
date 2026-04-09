import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ExecutionService } from '../services/execution.service';
import { queryKeys } from '../utils/query.helper';
import type { TListParams } from '@/types/api.type';

export const useFetchExecutions = (workspaceId: string, params?: TListParams) =>
	useQuery({
		queryKey: queryKeys.executions.list(workspaceId, params),
		queryFn: () => ExecutionService.fetchAll(workspaceId, params),
		enabled: !!workspaceId,
		staleTime: 30 * 1000, // 30 seconds — executions change frequently
	});

export const useFetchExecutionById = (workspaceId: string, id: string) =>
	useQuery({
		queryKey: queryKeys.executions.detail(id),
		queryFn: () => ExecutionService.fetchById(workspaceId, id),
		enabled: !!workspaceId && !!id,
	});

export const useFetchExecutionLogs = (workspaceId: string, id: string) =>
	useQuery({
		queryKey: queryKeys.executions.logs(id),
		queryFn: () => ExecutionService.fetchLogs(workspaceId, id),
		enabled: !!workspaceId && !!id,
	});

export const useCancelExecution = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ExecutionService.cancel(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.executions.all() });
			toast.success('Execution cancelled');
		},
		onError: () => {
			toast.error('Failed to cancel execution');
		},
	});
};

export const useRetryExecution = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ExecutionService.retry(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.executions.all() });
			toast.success('Execution retried');
		},
		onError: () => {
			toast.error('Failed to retry execution');
		},
	});
};
