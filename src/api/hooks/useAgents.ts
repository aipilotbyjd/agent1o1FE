import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agent.service';
import type { TAgent } from '@/types/agent.type';

export const useFetchAgents = (workspaceId: string) => {
	return useQuery({
		queryKey: ['agents', workspaceId],
		queryFn: () => agentService.list(workspaceId),
		enabled: !!workspaceId,
	});
};

export const useFetchAgent = (workspaceId: string, agentId: string) => {
	return useQuery({
		queryKey: ['agents', workspaceId, agentId],
		queryFn: () => agentService.get(workspaceId, agentId),
		enabled: !!workspaceId && !!agentId,
	});
};

export const useCreateAgent = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<TAgent>) => agentService.create(workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
		},
	});
};

export const useUpdateAgent = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<TAgent> }) =>
			agentService.update(workspaceId, id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
		},
	});
};

export const useDeleteAgent = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => agentService.delete(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
		},
	});
};

export const useDuplicateAgent = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => agentService.duplicate(workspaceId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
		},
	});
};

export const useFetchAgentSkills = (workspaceId: string) => {
	return useQuery({
		queryKey: ['agent-skills', workspaceId],
		queryFn: () => agentService.listSkills(workspaceId),
		enabled: !!workspaceId,
	});
};
