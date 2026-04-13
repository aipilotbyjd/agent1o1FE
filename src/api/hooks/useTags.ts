import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { TagService } from '../services/tag.service';
import { queryKeys } from '../utils/query.helper';
import type { TListParams } from '@/types/api.type';
import type { ICreateTagDto, IUpdateTagDto, ITagWorkflowsDto } from '@/types/tag.type';

export const useFetchTags = (workspaceId: string, params?: TListParams) =>
	useQuery({
		queryKey: queryKeys.tags.list(workspaceId, params),
		queryFn: () => TagService.fetchAll(workspaceId, params),
		enabled: !!workspaceId,
	});

export const useFetchTag = (workspaceId: string, id: string) =>
	useQuery({
		queryKey: queryKeys.tags.detail(workspaceId, id),
		queryFn: () => TagService.fetchById(workspaceId, id),
		enabled: !!workspaceId && !!id,
	});

export const useCreateTag = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ICreateTagDto) => TagService.create(workspaceId, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(workspaceId) });
			toast.success(`Tag "${data.name}" created!`);
		},
		onError: () => {
			toast.error('Failed to create tag');
		},
	});
};

export const useUpdateTag = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: IUpdateTagDto }) =>
			TagService.update(workspaceId, id, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(workspaceId) });
			toast.success(`Tag "${data.name}" updated!`);
		},
		onError: () => {
			toast.error('Failed to update tag');
		},
	});
};

export const useDeleteTag = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => TagService.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(workspaceId) });
			toast.success('Tag deleted!');
		},
		onError: () => {
			toast.error('Failed to delete tag');
		},
	});
};

export const useAttachTagWorkflows = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tagId, data }: { tagId: string; data: ITagWorkflowsDto }) =>
			TagService.attachWorkflows(workspaceId, tagId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
			toast.success('Workflows tagged!');
		},
		onError: () => {
			toast.error('Failed to tag workflows');
		},
	});
};

export const useDetachTagWorkflows = (workspaceId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tagId, data }: { tagId: string; data: ITagWorkflowsDto }) =>
			TagService.detachWorkflows(workspaceId, tagId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(workspaceId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all() });
			toast.success('Workflows untagged!');
		},
		onError: () => {
			toast.error('Failed to untag workflows');
		},
	});
};
