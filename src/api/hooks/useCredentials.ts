import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CredentialService } from '../services/credential.service';
import { queryKeys } from '../utils/query.helper';
import type {
	ICredentialFilters,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	IShareCredentialDto,
	IUpdateSharingScopeDto,
} from '@/types/credential.type';

// ── List ──────────────────────────────────────────────
export const useFetchCredentials = (
	workspaceId: string | undefined,
	filters?: ICredentialFilters,
) =>
	useQuery({
		queryKey: queryKeys.credentials.list(workspaceId, filters as Record<string, unknown>),
		queryFn: () => CredentialService.list(workspaceId!, filters),
		enabled: !!workspaceId,
	});

// ── Detail ────────────────────────────────────────────
export const useFetchCredential = (workspaceId: string | undefined, id: string | undefined) =>
	useQuery({
		queryKey: queryKeys.credentials.detail(workspaceId, id),
		queryFn: () => CredentialService.detail(workspaceId!, id!),
		enabled: !!workspaceId && !!id,
	});

// ── Create ────────────────────────────────────────────
export const useCreateCredential = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (dto: ICreateCredentialDto) => CredentialService.create(workspaceId!, dto),
		onSuccess: () => {
			toast.success('Credential created');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to create credential'),
	});
};

// ── Update ────────────────────────────────────────────
export const useUpdateCredential = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: IUpdateCredentialDto }) =>
			CredentialService.update(workspaceId!, id, dto),
		onSuccess: () => {
			toast.success('Credential updated');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to update credential'),
	});
};

// ── Delete ────────────────────────────────────────────
export const useDeleteCredential = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => CredentialService.delete(workspaceId!, id),
		onSuccess: () => {
			toast.success('Credential deleted');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to delete credential'),
	});
};

// ── Test Connection ───────────────────────────────────
export const useTestCredential = (workspaceId: string | undefined) =>
	useMutation({
		mutationFn: (id: string) => CredentialService.test(workspaceId!, id),
		onSuccess: (result) => {
			if (result.success) toast.success('Connection successful');
			else toast.warning(result.message || 'Connection test returned a warning');
		},
		onError: () => toast.error('Connection test failed'),
	});

// ── Refresh Token ─────────────────────────────────────
export const useRefreshCredentialToken = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => CredentialService.refreshToken(workspaceId!, id),
		onSuccess: () => {
			toast.success('Token refreshed');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to refresh token'),
	});
};

// ── Share ─────────────────────────────────────────────
export const useShareCredential = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: IShareCredentialDto }) =>
			CredentialService.share(workspaceId!, id, dto),
		onSuccess: () => {
			toast.success('Credential shared');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to share credential'),
	});
};

// ── Unshare ───────────────────────────────────────────
export const useUnshareCredential = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, userId }: { id: string; userId: string }) =>
			CredentialService.unshare(workspaceId!, id, userId),
		onSuccess: () => {
			toast.success('Access revoked');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to revoke access'),
	});
};

// ── Update Sharing Scope ──────────────────────────────
export const useUpdateSharingScope = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: IUpdateSharingScopeDto }) =>
			CredentialService.updateSharingScope(workspaceId!, id, dto),
		onSuccess: () => {
			toast.success('Sharing scope updated');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.credentials.all(workspaceId) });
		},
		onError: () => toast.error('Failed to update sharing scope'),
	});
};

// ── OAuth Providers ───────────────────────────────────
export const useFetchOAuthProviders = () =>
	useQuery({
		queryKey: ['oauth', 'providers'],
		queryFn: () => CredentialService.getOAuthProviders(),
	});

// ── Get OAuth Authorize URL ───────────────────────────
export const useGetOAuthAuthorizeUrl = (workspaceId: string | undefined) =>
	useMutation({
		mutationFn: (provider: string) =>
			CredentialService.getOAuthAuthorizeUrl(workspaceId!, provider),
	});
