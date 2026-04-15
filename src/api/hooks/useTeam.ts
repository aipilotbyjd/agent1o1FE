import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { WorkspaceMemberService, WorkspaceInvitationService, WorkspaceSettingsService } from '../services/workspace-member.service';
import { queryKeys } from '../utils/query.helper';
import type { TUpdateMemberRoleDto, TSendInvitationDto, TWorkspaceSettings } from '@/types/workspace.type';

// ─── Members ─────────────────────────────────────────────────

export const useFetchMembers = (workspaceId: string | undefined) =>
	useQuery({
		queryKey: queryKeys.members.list(workspaceId!),
		queryFn: () => WorkspaceMemberService.fetchMembers(workspaceId!),
		enabled: !!workspaceId,
	});

export const useUpdateMemberRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, userId, data }: { workspaceId: string; userId: string; data: TUpdateMemberRoleDto }) =>
			WorkspaceMemberService.updateRole(workspaceId, userId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.members.list(variables.workspaceId) });
			toast.success('Member role updated');
		},
		onError: () => {
			toast.error('Failed to update member role');
		},
	});
};

export const useRemoveMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
			WorkspaceMemberService.remove(workspaceId, userId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.members.list(variables.workspaceId) });
			toast.success('Member removed');
		},
		onError: () => {
			toast.error('Failed to remove member');
		},
	});
};

export const useLeaveWorkspace = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (workspaceId: string) => WorkspaceMemberService.leave(workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
			toast.success('You have left the workspace');
		},
		onError: () => {
			toast.error('Failed to leave workspace');
		},
	});
};

// ─── Invitations ─────────────────────────────────────────────

export const useFetchInvitations = (workspaceId: string | undefined) =>
	useQuery({
		queryKey: queryKeys.invitations.list(workspaceId!),
		queryFn: () => WorkspaceInvitationService.fetchAll(workspaceId!),
		enabled: !!workspaceId,
	});

export const useSendInvitation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, data }: { workspaceId: string; data: TSendInvitationDto }) =>
			WorkspaceInvitationService.send(workspaceId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.invitations.list(variables.workspaceId) });
			toast.success('Invitation sent!');
		},
		onError: () => {
			toast.error('Failed to send invitation');
		},
	});
};

export const useCancelInvitation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, invitationId }: { workspaceId: string; invitationId: string }) =>
			WorkspaceInvitationService.cancel(workspaceId, invitationId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.invitations.list(variables.workspaceId) });
			toast.success('Invitation cancelled');
		},
		onError: () => {
			toast.error('Failed to cancel invitation');
		},
	});
};

// ─── Workspace Settings ──────────────────────────────────────

export const useFetchWorkspaceSettings = (workspaceId: string | undefined) =>
	useQuery({
		queryKey: queryKeys.workspaceSettings.detail(workspaceId!),
		queryFn: () => WorkspaceSettingsService.fetch(workspaceId!),
		enabled: !!workspaceId,
	});

export const useUpdateWorkspaceSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, data }: { workspaceId: string; data: Partial<TWorkspaceSettings> }) =>
			WorkspaceSettingsService.update(workspaceId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSettings.detail(variables.workspaceId) });
			toast.success('Settings updated!');
		},
		onError: () => {
			toast.error('Failed to update settings');
		},
	});
};
