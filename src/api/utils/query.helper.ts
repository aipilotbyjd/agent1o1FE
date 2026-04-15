export const buildQueryParams = (params: Record<string, any>): string => {
	return Object.keys(params)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		.join('&');
};

// Query key factory for consistent keys across the app
export const queryKeys = {
	// Auth
	auth: {
		all: () => ['auth'] as const,
		user: () => ['auth', 'user'] as const,
	},

	// Workspaces
	workspaces: {
		all: () => ['workspaces'] as const,
		list: () => ['workspaces', 'list'] as const,
		detail: (id: string) => ['workspaces', 'detail', id] as const,
	},

	// Workflows (scoped by workspace)
	workflows: {
		all: () => ['workflows'] as const,
		list: (workspaceId: string, params?: Record<string, unknown>) =>
			['workflows', 'list', workspaceId, params] as const,
		detail: (id: string) => ['workflows', 'detail', id] as const,
		executions: (workspaceId: string, workflowId: string, params?: Record<string, unknown>) =>
			['workflows', 'executions', workspaceId, workflowId, params] as const,
		shares: (workspaceId: string, workflowId: string) =>
			['workflows', 'shares', workspaceId, workflowId] as const,
	},

	// Tags (scoped by workspace)
	tags: {
		all: (workspaceId: string) => ['tags', workspaceId] as const,
		list: (workspaceId: string, params?: Record<string, unknown>) =>
			['tags', 'list', workspaceId, params] as const,
		detail: (workspaceId: string, id: string) => ['tags', 'detail', workspaceId, id] as const,
	},

	// Public shares (no workspace scope)
	publicShares: {
		view: (token: string) => ['publicShares', 'view', token] as const,
	},

	// Folders (scoped by workspace)
	folders: {
		all: (workspaceId: string) => ['folders', workspaceId] as const,
		list: (workspaceId: string) => ['folders', workspaceId, 'list'] as const,
		detail: (workspaceId: string, id: string) => ['folders', workspaceId, 'detail', id] as const,
	},

	// Executions (scoped by workspace)
	executions: {
		all: (workspaceId?: string) => workspaceId ? ['executions', workspaceId] as const : ['executions'] as const,
		list: (workspaceId: string | undefined, params?: Record<string, unknown>) =>
			['executions', 'list', workspaceId, params] as const,
		detail: (workspaceId: string | undefined, id: string | undefined) =>
			['executions', 'detail', workspaceId, id] as const,
		logs: (id: string) => ['executions', 'logs', id] as const,
		nodes: (workspaceId: string | undefined, executionId: string | undefined) =>
			['executions', 'nodes', workspaceId, executionId] as const,
		nodeDetail: (workspaceId: string | undefined, executionId: string | undefined, nodeId: string | undefined) =>
			['executions', 'nodes', workspaceId, executionId, nodeId] as const,
		stats: (workspaceId: string | undefined, params?: Record<string, unknown>) =>
			['executions', 'stats', workspaceId, params] as const,
	},

	// Credentials (scoped by workspace)
	credentials: {
		all: (workspaceId?: string) => workspaceId ? ['credentials', workspaceId] as const : ['credentials'] as const,
		list: (workspaceId: string | undefined, params?: Record<string, unknown>) =>
			['credentials', 'list', workspaceId, params] as const,
		detail: (workspaceId: string | undefined, id: string | undefined) =>
			['credentials', 'detail', workspaceId, id] as const,
	},

	// Variables (scoped by workspace)
	variables: {
		all: (workspaceId?: string) => workspaceId ? ['variables', workspaceId] as const : ['variables'] as const,
		list: (workspaceId: string | undefined, params?: Record<string, unknown>) =>
			['variables', 'list', workspaceId, params] as const,
		detail: (workspaceId: string | undefined, id: string | undefined) =>
			['variables', 'detail', workspaceId, id] as const,
		resolve: (workspaceId: string | undefined, name: string | undefined) =>
			['variables', 'resolve', workspaceId, name] as const,
	},

	// Templates (global)
	templates: {
		all: () => ['templates'] as const,
		list: (params?: Record<string, unknown>) => ['templates', 'list', params] as const,
		featured: () => ['templates', 'featured'] as const,
		categories: () => ['templates', 'categories'] as const,
		detail: (id: string) => ['templates', 'detail', id] as const,
	},

	// Members (scoped by workspace)
	members: {
		all: (workspaceId: string) => ['members', workspaceId] as const,
		list: (workspaceId: string) => ['members', 'list', workspaceId] as const,
	},

	// Invitations (scoped by workspace)
	invitations: {
		all: (workspaceId: string) => ['invitations', workspaceId] as const,
		list: (workspaceId: string) => ['invitations', 'list', workspaceId] as const,
	},

	// Workspace Settings (scoped by workspace)
	workspaceSettings: {
		all: (workspaceId: string) => ['workspaceSettings', workspaceId] as const,
		detail: (workspaceId: string) => ['workspaceSettings', 'detail', workspaceId] as const,
	},

	// Dashboard (scoped by workspace)
	dashboard: {
		all: (workspaceId: string) => ['dashboard', workspaceId] as const,
		data: (workspaceId: string, period: string) => ['dashboard', 'data', workspaceId, period] as const,
		stats: (workspaceId: string) => ['dashboard', 'stats', workspaceId] as const,
	},
};
