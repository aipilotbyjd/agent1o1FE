import axiosClient from '../http/axios.config';
import type { TAgent, TAgentSkill, TAgentConversation } from '../../types/agent.type';

export const agentService = {
	// Agents
	list: (workspaceId: string) =>
		axiosClient.get<{ data: TAgent[] }>(`/workspaces/${workspaceId}/agents`),

	get: (workspaceId: string, agentId: string) =>
		axiosClient.get<{ data: TAgent }>(`/workspaces/${workspaceId}/agents/${agentId}`),

	create: (workspaceId: string, data: Partial<TAgent>) =>
		axiosClient.post<{ data: TAgent }>(`/workspaces/${workspaceId}/agents`, data),

	update: (workspaceId: string, agentId: string, data: Partial<TAgent>) =>
		axiosClient.put<{ data: TAgent }>(`/workspaces/${workspaceId}/agents/${agentId}`, data),

	delete: (workspaceId: string, agentId: string) =>
		axiosClient.delete(`/workspaces/${workspaceId}/agents/${agentId}`),

	duplicate: (workspaceId: string, agentId: string) =>
		axiosClient.post<{ data: TAgent }>(`/workspaces/${workspaceId}/agents/${agentId}/duplicate`),

	// Skills
	listSkills: (workspaceId: string) =>
		axiosClient.get<{ data: TAgentSkill[] }>(`/workspaces/${workspaceId}/agent-skills`),

	createSkill: (workspaceId: string, data: Partial<TAgentSkill>) =>
		axiosClient.post<{ data: TAgentSkill }>(`/workspaces/${workspaceId}/agent-skills`, data),

	attachSkill: (workspaceId: string, agentId: string, skillId: string) =>
		axiosClient.post(`/workspaces/${workspaceId}/agents/${agentId}/skills/attach`, {
			skill_id: skillId,
		}),

	detachSkill: (workspaceId: string, agentId: string, skillId: string) =>
		axiosClient.delete(`/workspaces/${workspaceId}/agents/${agentId}/skills/${skillId}`),

	// Conversations
	listConversations: (workspaceId: string, agentId: string) =>
		axiosClient.get<{ data: TAgentConversation[] }>(
			`/workspaces/${workspaceId}/agents/${agentId}/conversations`,
		),
};
