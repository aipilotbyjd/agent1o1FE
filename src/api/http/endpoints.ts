/**
 * API Endpoints
 * Matches the Laravel 12 backend routes from docs/frontend/
 */

export const AuthEndpoints = {
	LOGIN: '/auth/login',
	REGISTER: '/auth/register',
	LOGOUT: '/auth/logout',
	REFRESH: '/auth/refresh',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
} as const;

export const UserEndpoints = {
	ME: '/user',
	UPDATE: '/user',
	CHANGE_PASSWORD: '/user/password',
	UPLOAD_AVATAR: '/user/avatar',
	DELETE_AVATAR: '/user/avatar',
} as const;

export const WorkspaceEndpoints = {
	LIST: '/workspaces',
	CREATE: '/workspaces',
	DETAIL: (id: string) => `/workspaces/${id}`,
	UPDATE: (id: string) => `/workspaces/${id}`,
	DELETE: (id: string) => `/workspaces/${id}`,
} as const;

export const WorkflowEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/workflows`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/workflows`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}`,
	UPDATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}`,
	DELETE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}`,
	EXECUTE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/execute`,
	ACTIVATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/activate`,
	DEACTIVATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/deactivate`,
	DUPLICATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/duplicate`,
} as const;

export const ExecutionEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/executions`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}`,
	LOGS: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/logs`,
	CANCEL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/cancel`,
	RETRY: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/retry`,
} as const;
