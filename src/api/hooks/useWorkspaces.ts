import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { WorkspaceService } from '../services/workspace.service';
import { queryKeys } from '../utils/query.helper';
import type { TCreateWorkspaceDto, TUpdateWorkspaceDto } from '@/types/workspace.type';

export const useFetchWorkspaces = () =>
	useQuery({
		queryKey: queryKeys.workspaces.list(),
		queryFn: WorkspaceService.fetchAll,
		staleTime: 10 * 60 * 1000,
	});

export const useFetchWorkspaceById = (id: string) =>
	useQuery({
		queryKey: queryKeys.workspaces.detail(id),
		queryFn: () => WorkspaceService.fetchById(id),
		enabled: !!id,
	});

export const useCreateWorkspace = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: TCreateWorkspaceDto) => WorkspaceService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
			toast.success('Workspace created!');
		},
		onError: () => {
			toast.error('Failed to create workspace');
		},
	});
};

export const useUpdateWorkspace = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateWorkspaceDto }) =>
			WorkspaceService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
			toast.success('Workspace updated!');
		},
		onError: () => {
			toast.error('Failed to update workspace');
		},
	});
};

export const useDeleteWorkspace = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkspaceService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
			toast.success('Workspace deleted');
		},
		onError: () => {
			toast.error('Failed to delete workspace');
		},
	});
};
