/**
 * Workspace Types
 * Matches Laravel backend from docs/frontend/modules/02-workspace-management.md
 */

export type TWorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

// Workspace entity — as returned by GET /api/v1/workspaces
export type TWorkspace = {
	id: string;
	name: string;
	slug: string;
	role: TWorkspaceRole;
	created_at: string;
};

// Workspace detail — as returned by GET /api/v1/workspaces/{id}
export type TWorkspaceDetail = TWorkspace & {
	settings: TWorkspaceSettings;
	members_count: number;
	workflows_count: number;
};

export type TWorkspaceSettings = {
	timezone: string;
	default_workflow_timeout: number;
};

// ─── Request DTOs ────────────────────────────────────────────

// POST /workspaces
export type TCreateWorkspaceDto = {
	name: string;
	slug: string;
};

// PUT /workspaces/{id}
export type TUpdateWorkspaceDto = {
	name?: string;
	settings?: Partial<TWorkspaceSettings>;
};
