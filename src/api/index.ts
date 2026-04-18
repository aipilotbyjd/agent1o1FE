// ─── HTTP Layer ──────────────────────────────────────────────
export { axiosClient } from './http';
export {
	AuthEndpoints,
	UserEndpoints,
	WorkspaceEndpoints,
	WorkflowEndpoints,
	ExecutionEndpoints,
	CredentialEndpoints,
	VariableEndpoints,
	TemplateEndpoints,
	OAuthEndpoints,
	DashboardEndpoints,
} from './http';

// ─── Services ────────────────────────────────────────────────
export { AuthService } from './services';
export { UserService } from './services';
export { WorkspaceService } from './services';
export { WorkflowService } from './services';
export { ExecutionService } from './services';
export { CredentialService } from './services';
export { VariableService } from './services';
export { TemplateService } from './services';
export { DashboardService } from './services';

// ─── Auth Hooks ──────────────────────────────────────────────
export {
	useCurrentUser,
	useLogin,
	useRegister,
	useLogout,
	useForgotPassword,
	useResetPassword,
	useUpdateProfile,
	useChangePassword,
	useUploadAvatar,
	useDeleteAvatar,
} from './hooks';

// ─── User Hooks ──────────────────────────────────────────────
export {
	useFetchCurrentUser,
	useUpdateUserProfile,
	useChangeUserPassword,
} from './hooks';

// ─── Workspace Hooks ─────────────────────────────────────────
export {
	useFetchWorkspaces,
	useFetchWorkspaceById,
	useCreateWorkspace,
	useUpdateWorkspace,
	useDeleteWorkspace,
} from './hooks';

// ─── Workflow Hooks ──────────────────────────────────────────
export {
	useFetchWorkflows,
	useFetchWorkflowById,
	useCreateWorkflow,
	useUpdateWorkflow,
	useDeleteWorkflow,
} from './hooks';

// ─── Execution Hooks ─────────────────────────────────────────
export {
	useFetchExecutions,
	useFetchExecutionById,
	useFetchExecutionLogs,
	useCancelExecution,
	useRetryExecution,
} from './hooks';

// ─── Credential Hooks ────────────────────────────────
export {
	useFetchCredentials,
	useFetchCredential,
	useCreateCredential,
	useUpdateCredential,
	useDeleteCredential,
	useTestCredential,
	useRefreshCredentialToken,
	useShareCredential,
	useUnshareCredential,
	useUpdateSharingScope,
	useFetchOAuthProviders,
	useStartOAuth,
	useGetOAuthAuthorizeUrl,
} from './hooks';

// ─── Variable Hooks ──────────────────────────────────
export {
	useFetchVariables,
	useFetchVariable,
	useResolveVariable,
	useCreateVariable,
	useUpdateVariable,
	useDeleteVariable,
} from './hooks';

// ─── Template Hooks ──────────────────────────────────
export {
	useFetchTemplates,
	useFetchFeaturedTemplates,
	useFetchTemplateCategories,
	useFetchTemplate,
	useTrackTemplateView,
	useUseTemplate,
} from './hooks';

// ─── Dashboard Hooks ─────────────────────────────────
export {
	useFetchDashboard,
	useFetchQuickStats,
} from './hooks';

// ─── Utils ───────────────────────────────────────────────────
export {
	TokenManager,
	getAccessToken,
	setToken,
	clearTokens,
	hasValidToken,
	isRememberMe,
	buildQueryParams,
	queryKeys,
	parseApiError,
} from './utils';
export type { ApiError } from './utils';
