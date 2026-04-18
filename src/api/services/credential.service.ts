import axiosClient from '../http/axios.config';
import { CredentialEndpoints, OAuthEndpoints } from '../http/endpoints';
import { buildQueryParams } from '../utils/query.helper';
import type { TApiResponse } from '@/types/api.type';
import type {
	ICredential,
	ICredentialDetail,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	IShareCredentialDto,
	IUpdateSharingScopeDto,
	ICredentialFilters,
	IOAuthProvider,
	IOAuthAuthResponse,
	IStartOAuthDto,
} from '@/types/credential.type';

const buildOAuthAuthorizeParams = (params: IStartOAuthDto): string => {
	const searchParams = new URLSearchParams();
	if (params.credentialName) searchParams.set('credential_name', params.credentialName);
	if (params.redirectUrl) searchParams.set('redirect_url', params.redirectUrl);
	if (params.sharingScope) searchParams.set('sharing_scope', params.sharingScope);
	if (params.userIds?.length) searchParams.set('user_ids', params.userIds.join(','));
	return searchParams.toString();
};

export const CredentialService = {
	list: async (workspaceId: string, filters?: ICredentialFilters): Promise<ICredential[]> => {
		const params = filters ? `?${buildQueryParams(filters)}` : '';
		const { data } = await axiosClient.get<TApiResponse<ICredential[]>>(
			`${CredentialEndpoints.LIST(workspaceId)}${params}`,
		);
		return data.data;
	},

	detail: async (workspaceId: string, id: string): Promise<ICredentialDetail> => {
		const { data } = await axiosClient.get<TApiResponse<ICredentialDetail>>(
			CredentialEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	create: async (workspaceId: string, dto: ICreateCredentialDto): Promise<ICredential> => {
		const { data } = await axiosClient.post<TApiResponse<ICredential>>(
			CredentialEndpoints.CREATE(workspaceId),
			dto,
		);
		return data.data;
	},

	update: async (workspaceId: string, id: string, dto: IUpdateCredentialDto): Promise<ICredential> => {
		const { data } = await axiosClient.put<TApiResponse<ICredential>>(
			CredentialEndpoints.UPDATE(workspaceId, id),
			dto,
		);
		return data.data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.delete(CredentialEndpoints.DELETE(workspaceId, id));
	},

	test: async (workspaceId: string, id: string): Promise<{ success: boolean; message: string }> => {
		const { data } = await axiosClient.post<TApiResponse<{ success: boolean; message: string }>>(
			CredentialEndpoints.TEST(workspaceId, id),
		);
		return data.data;
	},

	refreshToken: async (workspaceId: string, id: string): Promise<ICredential> => {
		const { data } = await axiosClient.post<TApiResponse<ICredential>>(
			CredentialEndpoints.REFRESH(workspaceId, id),
		);
		return data.data;
	},

	share: async (workspaceId: string, id: string, dto: IShareCredentialDto): Promise<void> => {
		await axiosClient.post(CredentialEndpoints.SHARE(workspaceId, id), dto);
	},

	unshare: async (workspaceId: string, id: string, userId: string): Promise<void> => {
		await axiosClient.delete(CredentialEndpoints.UNSHARE(workspaceId, id, userId));
	},

	updateSharingScope: async (
		workspaceId: string,
		id: string,
		dto: IUpdateSharingScopeDto,
	): Promise<ICredential> => {
		const { data } = await axiosClient.put<TApiResponse<ICredential>>(
			CredentialEndpoints.SHARING_SCOPE(workspaceId, id),
			dto,
		);
		return data.data;
	},

	getOAuthProviders: async (): Promise<IOAuthProvider[]> => {
		const { data } = await axiosClient.get<TApiResponse<IOAuthProvider[]>>(OAuthEndpoints.PROVIDERS);
		return data.data;
	},

	getOAuthAuthorizeUrl: async (
		workspaceId: string,
		params: string | IStartOAuthDto,
	): Promise<IOAuthAuthResponse> => {
		const normalizedParams =
			typeof params === 'string' ? { provider: params } : { ...params, workspaceId };
		const query = buildOAuthAuthorizeParams(normalizedParams);
		const { data } = await axiosClient.get<TApiResponse<IOAuthAuthResponse>>(
			`${OAuthEndpoints.AUTHORIZE(workspaceId, normalizedParams.provider)}${query ? `?${query}` : ''}`,
		);
		return data.data;
	},
};
