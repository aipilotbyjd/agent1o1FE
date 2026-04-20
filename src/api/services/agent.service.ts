import axiosClient from '../http/axios.config';
import { AgentEndpoints, AgentSkillEndpoints } from '../http/endpoints';
import type { TApiResponse } from '@/types/api.type';
import type { TAgent, TAgentSkill, TAgentConversation } from '@/types/agent.type';

export const AgentService = {
	// ── Agents ───────────────────────────────────────────
	list: async (workspaceId: string): Promise<TAgent[]> => {
		const { data } = await axiosClient.get<TApiResponse<TAgent[]>>(
			AgentEndpoints.LIST(workspaceId),
		);
		return data.data;
	},

	detail: async (workspaceId: string, agentId: string): Promise<TAgent> => {
		const { data } = await axiosClient.get<TApiResponse<TAgent>>(
			AgentEndpoints.DETAIL(workspaceId, agentId),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: Partial<TAgent>): Promise<TAgent> => {
		const { data } = await axiosClient.post<TApiResponse<TAgent>>(
			AgentEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, agentId: string, payload: Partial<TAgent>): Promise<TAgent> => {
		const { data } = await axiosClient.put<TApiResponse<TAgent>>(
			AgentEndpoints.UPDATE(workspaceId, agentId),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, agentId: string): Promise<void> => {
		await axiosClient.delete(AgentEndpoints.DELETE(workspaceId, agentId));
	},

	duplicate: async (workspaceId: string, agentId: string): Promise<TAgent> => {
		const { data } = await axiosClient.post<TApiResponse<TAgent>>(
			AgentEndpoints.DUPLICATE(workspaceId, agentId),
		);
		return data.data;
	},

	attachSkill: async (workspaceId: string, agentId: string, skillId: string): Promise<void> => {
		await axiosClient.post(AgentEndpoints.ATTACH_SKILL(workspaceId, agentId), {
			skill_id: skillId,
		});
	},

	detachSkill: async (workspaceId: string, agentId: string, skillId: string): Promise<void> => {
		await axiosClient.delete(AgentEndpoints.DETACH_SKILL(workspaceId, agentId, skillId));
	},

	listConversations: async (workspaceId: string, agentId: string): Promise<TAgentConversation[]> => {
		const { data } = await axiosClient.get<TApiResponse<TAgentConversation[]>>(
			AgentEndpoints.CONVERSATIONS(workspaceId, agentId),
		);
		return data.data;
	},

	// ── Skills ───────────────────────────────────────────
	listSkills: async (workspaceId: string): Promise<TAgentSkill[]> => {
		const { data } = await axiosClient.get<TApiResponse<TAgentSkill[]>>(
			AgentSkillEndpoints.LIST(workspaceId),
		);
		return data.data;
	},

	createSkill: async (workspaceId: string, payload: Partial<TAgentSkill>): Promise<TAgentSkill> => {
		const { data } = await axiosClient.post<TApiResponse<TAgentSkill>>(
			AgentSkillEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	updateSkill: async (workspaceId: string, skillId: string, payload: Partial<TAgentSkill>): Promise<TAgentSkill> => {
		const { data } = await axiosClient.put<TApiResponse<TAgentSkill>>(
			AgentSkillEndpoints.UPDATE(workspaceId, skillId),
			payload,
		);
		return data.data;
	},

	deleteSkill: async (workspaceId: string, skillId: string): Promise<void> => {
		await axiosClient.delete(AgentSkillEndpoints.DELETE(workspaceId, skillId));
	},
};
