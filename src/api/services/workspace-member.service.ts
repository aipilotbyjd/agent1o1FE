import axiosClient from '../http/axios.config';
import { WorkspaceMemberEndpoints, WorkspaceInvitationEndpoints, WorkspaceSettingsEndpoints } from '../http/endpoints';
import type {
	TWorkspaceMember,
	TWorkspaceInvitation,
	TUpdateMemberRoleDto,
	TSendInvitationDto,
	TWorkspaceSettings,
} from '@/types/workspace.type';
import type { TApiResponse, TMessageResponse } from '@/types/api.type';

export const WorkspaceMemberService = {
	// GET /workspaces/{id}/members
	fetchMembers: async (workspaceId: string): Promise<TWorkspaceMember[]> => {
		const { data } = await axiosClient.get<TApiResponse<TWorkspaceMember[]>>(
			WorkspaceMemberEndpoints.LIST(workspaceId),
		);
		return data.data;
	},

	// PUT /workspaces/{id}/members/{userId}
	updateRole: async (workspaceId: string, userId: string, payload: TUpdateMemberRoleDto): Promise<TWorkspaceMember> => {
		const { data } = await axiosClient.put<TApiResponse<TWorkspaceMember>>(
			WorkspaceMemberEndpoints.UPDATE_ROLE(workspaceId, userId),
			payload,
		);
		return data.data;
	},

	// DELETE /workspaces/{id}/members/{userId}
	remove: async (workspaceId: string, userId: string): Promise<void> => {
		await axiosClient.delete(WorkspaceMemberEndpoints.REMOVE(workspaceId, userId));
	},

	// POST /workspaces/{id}/transfer-ownership
	transferOwnership: async (workspaceId: string, newOwnerId: string): Promise<TMessageResponse> => {
		const { data } = await axiosClient.post<TMessageResponse>(
			WorkspaceMemberEndpoints.TRANSFER_OWNERSHIP(workspaceId),
			{ new_owner_id: newOwnerId },
		);
		return data;
	},

	// POST /workspaces/{id}/leave
	leave: async (workspaceId: string): Promise<TMessageResponse> => {
		const { data } = await axiosClient.post<TMessageResponse>(
			WorkspaceMemberEndpoints.LEAVE(workspaceId),
		);
		return data;
	},
};

export const WorkspaceInvitationService = {
	// GET /workspaces/{id}/invitations
	fetchAll: async (workspaceId: string): Promise<TWorkspaceInvitation[]> => {
		const { data } = await axiosClient.get<TApiResponse<TWorkspaceInvitation[]>>(
			WorkspaceInvitationEndpoints.LIST(workspaceId),
		);
		return data.data;
	},

	// POST /workspaces/{id}/invitations
	send: async (workspaceId: string, payload: TSendInvitationDto): Promise<TWorkspaceInvitation> => {
		const { data } = await axiosClient.post<TApiResponse<TWorkspaceInvitation>>(
			WorkspaceInvitationEndpoints.SEND(workspaceId),
			payload,
		);
		return data.data;
	},

	// DELETE /workspaces/{id}/invitations/{invitationId}
	cancel: async (workspaceId: string, invitationId: string): Promise<void> => {
		await axiosClient.delete(WorkspaceInvitationEndpoints.CANCEL(workspaceId, invitationId));
	},
};

export const WorkspaceSettingsService = {
	// GET /workspaces/{id}/settings
	fetch: async (workspaceId: string): Promise<TWorkspaceSettings> => {
		const { data } = await axiosClient.get<TApiResponse<TWorkspaceSettings>>(
			WorkspaceSettingsEndpoints.GET(workspaceId),
		);
		return data.data;
	},

	// PUT /workspaces/{id}/settings
	update: async (workspaceId: string, payload: Partial<TWorkspaceSettings>): Promise<TMessageResponse> => {
		const { data } = await axiosClient.put<TMessageResponse>(
			WorkspaceSettingsEndpoints.UPDATE(workspaceId),
			payload,
		);
		return data;
	},
};
