import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FolderService } from '../services/folder.service';
import { queryKeys } from '../utils/query.helper';
import type { ICreateFolderDto, IUpdateFolderDto } from '@/types/folder.type';

export const useFetchFolders = (workspaceId: string) =>
	useQuery({
		queryKey: queryKeys.folders.list(workspaceId),
		queryFn: () => FolderService.fetchAll(workspaceId),
		enabled: !!workspaceId,
	});

export const useFetchFolderById = (workspaceId: string, id: string) =>
	useQuery({
		queryKey: queryKeys.folders.detail(workspaceId, id),
		queryFn: () => FolderService.fetchById(workspaceId, id),
		enabled: !!workspaceId && !!id,
	});

export const useCreateFolder = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ICreateFolderDto) => FolderService.create(workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.folders.all(workspaceId) });
			toast.success('Folder created!');
		},
		onError: () => {
			toast.error('Failed to create folder');
		},
	});
};

export const useUpdateFolder = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IUpdateFolderDto }) =>
			FolderService.update(workspaceId, id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.folders.all(workspaceId) });
			toast.success('Folder updated!');
		},
		onError: () => {
			toast.error('Failed to update folder');
		},
	});
};

export const useDeleteFolder = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => FolderService.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.folders.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
			toast.success('Folder deleted!');
		},
		onError: () => {
			toast.error('Failed to delete folder');
		},
	});
};
