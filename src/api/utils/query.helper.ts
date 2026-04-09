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
	},

	// Executions (scoped by workspace)
	executions: {
		all: () => ['executions'] as const,
		list: (workspaceId: string, params?: Record<string, unknown>) =>
			['executions', 'list', workspaceId, params] as const,
		detail: (id: string) => ['executions', 'detail', id] as const,
		logs: (id: string) => ['executions', 'logs', id] as const,
	},
};
