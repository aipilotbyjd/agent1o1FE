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

export const WorkspaceMemberEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
	UPDATE_ROLE: (workspaceId: string, userId: string) => `/workspaces/${workspaceId}/members/${userId}`,
	REMOVE: (workspaceId: string, userId: string) => `/workspaces/${workspaceId}/members/${userId}`,
	TRANSFER_OWNERSHIP: (workspaceId: string) => `/workspaces/${workspaceId}/transfer-ownership`,
	LEAVE: (workspaceId: string) => `/workspaces/${workspaceId}/leave`,
} as const;

export const WorkspaceInvitationEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/invitations`,
	SEND: (workspaceId: string) => `/workspaces/${workspaceId}/invitations`,
	CANCEL: (workspaceId: string, invitationId: string) => `/workspaces/${workspaceId}/invitations/${invitationId}`,
} as const;

export const WorkspaceSettingsEndpoints = {
	GET: (workspaceId: string) => `/workspaces/${workspaceId}/settings`,
	UPDATE: (workspaceId: string) => `/workspaces/${workspaceId}/settings`,
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
	IMPORT: (workspaceId: string) => `/workspaces/${workspaceId}/workflows/import`,
	EXPORT: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/export`,
	EXECUTIONS: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/executions`,
} as const;

export const WorkflowShareEndpoints = {
	LIST: (workspaceId: string, workflowId: string) =>
		`/workspaces/${workspaceId}/workflows/${workflowId}/shares`,
	CREATE: (workspaceId: string, workflowId: string) =>
		`/workspaces/${workspaceId}/workflows/${workflowId}/shares`,
	UPDATE: (workspaceId: string, workflowId: string, shareId: string) =>
		`/workspaces/${workspaceId}/workflows/${workflowId}/shares/${shareId}`,
	DELETE: (workspaceId: string, workflowId: string, shareId: string) =>
		`/workspaces/${workspaceId}/workflows/${workflowId}/shares/${shareId}`,
	VIEW_PUBLIC: (token: string) => `/shared/${token}`,
	CLONE_PUBLIC: (workspaceId: string, token: string) =>
		`/workspaces/${workspaceId}/shared/${token}/clone`,
} as const;

export const FolderEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/folders`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/folders`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/folders/${id}`,
	UPDATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/folders/${id}`,
	DELETE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/folders/${id}`,
	MOVE_WORKFLOWS: (workspaceId: string) => `/workspaces/${workspaceId}/folders/move-workflows`,
} as const;

export const TagEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/tags`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/tags`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/tags/${id}`,
	UPDATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/tags/${id}`,
	DELETE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/tags/${id}`,
	ATTACH_WORKFLOWS: (workspaceId: string, tagId: string) =>
		`/workspaces/${workspaceId}/tags/${tagId}/workflows`,
	DETACH_WORKFLOWS: (workspaceId: string, tagId: string) =>
		`/workspaces/${workspaceId}/tags/${tagId}/workflows`,
} as const;

export const ExecutionEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/executions`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}`,
	LOGS: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/logs`,
	CANCEL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/cancel`,
	RETRY: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/retry`,
	NODES: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/executions/${id}/nodes`,
	NODE_DETAIL: (workspaceId: string, id: string, nodeId: string) =>
		`/workspaces/${workspaceId}/executions/${id}/nodes/${nodeId}`,
	STATS: (workspaceId: string) => `/workspaces/${workspaceId}/executions/stats`,
	BULK_DELETE: (workspaceId: string) => `/workspaces/${workspaceId}/executions/bulk`,
} as const;

export const CredentialEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/credentials`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/credentials`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}`,
	UPDATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}`,
	DELETE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}`,
	TEST: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}/test`,
	REFRESH: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}/refresh`,
	SHARES: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}/shares`,
	SHARE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/credentials/${id}/share`,
	UNSHARE: (workspaceId: string, id: string, userId: string) =>
		`/workspaces/${workspaceId}/credentials/${id}/shares/${userId}`,
	SHARING_SCOPE: (workspaceId: string, id: string) =>
		`/workspaces/${workspaceId}/credentials/${id}/sharing-scope`,
} as const;

export const VariableEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/variables`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/variables`,
	DETAIL: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/variables/${id}`,
	UPDATE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/variables/${id}`,
	DELETE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/variables/${id}`,
	RESOLVE: (workspaceId: string) => `/workspaces/${workspaceId}/variables/resolve`,
} as const;

export const TemplateEndpoints = {
	LIST: '/templates',
	FEATURED: '/templates/featured',
	CATEGORIES: '/templates/categories',
	DETAIL: (id: string) => `/templates/${id}`,
	VIEW: (id: string) => `/templates/${id}/view`,
	USE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/templates/${id}/use`,
} as const;

export const OAuthEndpoints = {
	PROVIDERS: '/oauth/providers',
	AUTHORIZE: (workspaceId: string, provider: string) =>
		`/workspaces/${workspaceId}/oauth/authorize/${provider}`,
} as const;

export const DashboardEndpoints = {
	DATA: (workspaceId: string) => `/workspaces/${workspaceId}/dashboard`,
	STATS: (workspaceId: string) => `/workspaces/${workspaceId}/stats`,
} as const;

export const NodeTypeEndpoints = {
	LIST: '/node-types',
	CATEGORIES: '/node-types/categories',
	DETAIL: (nodeType: string) => `/node-types/${nodeType}`,
} as const;

export const NoteEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/notes`,
	DETAIL: (workspaceId: string, noteId: string) => `/workspaces/${workspaceId}/notes/${noteId}`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/notes`,
	UPDATE: (workspaceId: string, noteId: string) => `/workspaces/${workspaceId}/notes/${noteId}`,
	DELETE: (workspaceId: string, noteId: string) => `/workspaces/${workspaceId}/notes/${noteId}`,
} as const;

export const AgentEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/agents`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/agents`,
	DETAIL: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}`,
	UPDATE: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}`,
	DELETE: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}`,
	DUPLICATE: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}/duplicate`,
	ATTACH_SKILL: (workspaceId: string, agentId: string) =>
		`/workspaces/${workspaceId}/agents/${agentId}/skills/attach`,
	DETACH_SKILL: (workspaceId: string, agentId: string, skillId: string) =>
		`/workspaces/${workspaceId}/agents/${agentId}/skills/${skillId}`,
	CONVERSATIONS: (workspaceId: string, agentId: string) =>
		`/workspaces/${workspaceId}/agents/${agentId}/conversations`,
} as const;

export const AgentSkillEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/agent-skills`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/agent-skills`,
	UPDATE: (workspaceId: string, skillId: string) => `/workspaces/${workspaceId}/agent-skills/${skillId}`,
	DELETE: (workspaceId: string, skillId: string) => `/workspaces/${workspaceId}/agent-skills/${skillId}`,
} as const;

export const WebhookEndpoints = {
	LIST: (workspaceId: string) => `/workspaces/${workspaceId}/webhooks`,
	CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/webhooks`,
	DETAIL: (workspaceId: string, webhookId: string) => `/workspaces/${workspaceId}/webhooks/${webhookId}`,
	UPDATE: (workspaceId: string, webhookId: string) => `/workspaces/${workspaceId}/webhooks/${webhookId}`,
	DELETE: (workspaceId: string, webhookId: string) => `/workspaces/${workspaceId}/webhooks/${webhookId}`,
	ACTIVATE: (workspaceId: string, webhookId: string) =>
		`/workspaces/${workspaceId}/webhooks/${webhookId}/activate`,
	DEACTIVATE: (workspaceId: string, webhookId: string) =>
		`/workspaces/${workspaceId}/webhooks/${webhookId}/deactivate`,
	TEST: (workspaceId: string, webhookId: string) =>
		`/workspaces/${workspaceId}/webhooks/${webhookId}/test`,
	LOGS: (workspaceId: string, webhookId: string) =>
		`/workspaces/${workspaceId}/webhooks/${webhookId}/logs`,
	LOG_DETAIL: (workspaceId: string, webhookId: string, logId: string) =>
		`/workspaces/${workspaceId}/webhooks/${webhookId}/logs/${logId}`,
} as const;

export const WorkflowEditorEndpoints = {
	VERSIONS: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/versions`,
	VERSION: (workspaceId: string, id: string, version: number) =>
		`/workspaces/${workspaceId}/workflows/${id}/versions/${version}`,
	ROLLBACK: (workspaceId: string, id: string, version: number) =>
		`/workspaces/${workspaceId}/workflows/${id}/versions/${version}/rollback`,
	COMPARE_VERSIONS: (workspaceId: string, id: string) =>
		`/workspaces/${workspaceId}/workflows/${id}/compare-versions`,
	VALIDATE: (workspaceId: string) => `/workspaces/${workspaceId}/workflows/validate`,
	TEST_NODE: (workspaceId: string) => `/workspaces/${workspaceId}/workflows/test-node`,
	CLONE: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/clone`,
	PINNED_DATA: (workspaceId: string, id: string) =>
		`/workspaces/${workspaceId}/workflows/${id}/pinned-data`,
	PINNED_DATA_NODE: (workspaceId: string, id: string, nodeId: string) =>
		`/workspaces/${workspaceId}/workflows/${id}/pinned-data/${nodeId}`,
} as const;
