import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AgentService } from '../services/agent.service';
import { queryKeys } from '../utils/query.helper';
import type { TAgent, TAgentSkill } from '@/types/agent.type';

// ── Agents ───────────────────────────────────────────────

export const useFetchAgents = (workspaceId: string) =>
	useQuery({
		queryKey: queryKeys.agents.all(workspaceId),
		queryFn: () => AgentService.list(workspaceId),
		enabled: !!workspaceId,
	});

export const useFetchAgent = (workspaceId: string, agentId: string) =>
	useQuery({
		queryKey: queryKeys.agents.detail(workspaceId, agentId),
		queryFn: () => AgentService.detail(workspaceId, agentId),
		enabled: !!workspaceId && !!agentId,
	});

export const useCreateAgent = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Partial<TAgent>) => AgentService.create(workspaceId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
			toast.success('Agent created!');
		},
		onError: () => toast.error('Failed to create agent'),
	});
};

export const useUpdateAgent = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<TAgent> }) =>
			AgentService.update(workspaceId, id, data),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
			qc.invalidateQueries({ queryKey: queryKeys.agents.detail(workspaceId, variables.id) });
		},
		onError: () => toast.error('Failed to update agent'),
	});
};

export const useDeleteAgent = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => AgentService.delete(workspaceId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
			toast.success('Agent deleted!');
		},
		onError: () => toast.error('Failed to delete agent'),
	});
};

export const useDuplicateAgent = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => AgentService.duplicate(workspaceId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
			toast.success('Agent duplicated!');
		},
		onError: () => toast.error('Failed to duplicate agent'),
	});
};

// ── Agent Skills ─────────────────────────────────────────

export const useFetchAgentSkills = (workspaceId: string) =>
	useQuery({
		queryKey: queryKeys.agentSkills.all(workspaceId),
		queryFn: () => AgentService.listSkills(workspaceId),
		enabled: !!workspaceId,
	});

export const useCreateAgentSkill = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Partial<TAgentSkill>) => AgentService.createSkill(workspaceId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.agentSkills.all(workspaceId) });
			toast.success('Skill created!');
		},
		onError: () => toast.error('Failed to create skill'),
	});
};

export const useUpdateAgentSkill = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<TAgentSkill> }) =>
			AgentService.updateSkill(workspaceId, id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.agentSkills.all(workspaceId) });
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
		},
		onError: () => toast.error('Failed to update skill'),
	});
};

export const useDeleteAgentSkill = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => AgentService.deleteSkill(workspaceId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.agentSkills.all(workspaceId) });
			toast.success('Skill deleted!');
		},
		onError: () => toast.error('Failed to delete skill'),
	});
};

export const useAttachAgentSkill = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ agentId, skillId }: { agentId: string; skillId: string }) =>
			AgentService.attachSkill(workspaceId, agentId, skillId),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
			qc.invalidateQueries({ queryKey: queryKeys.agents.detail(workspaceId, variables.agentId) });
			qc.invalidateQueries({ queryKey: queryKeys.agentSkills.all(workspaceId) });
		},
		onError: () => toast.error('Failed to attach skill'),
	});
};

export const useDetachAgentSkill = (workspaceId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ agentId, skillId }: { agentId: string; skillId: string }) =>
			AgentService.detachSkill(workspaceId, agentId, skillId),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.agents.all(workspaceId) });
			qc.invalidateQueries({ queryKey: queryKeys.agents.detail(workspaceId, variables.agentId) });
			qc.invalidateQueries({ queryKey: queryKeys.agentSkills.all(workspaceId) });
		},
		onError: () => toast.error('Failed to detach skill'),
	});
};
