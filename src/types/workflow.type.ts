/**
 * Workflow Types
 * Matches Laravel backend from docs/frontend/modules/04-workflow-management.md
 */

export type TWorkflowStatus = 'active' | 'inactive';

// Workflow list item — as returned in GET /workspaces/{id}/workflows
export type TWorkflow = {
	id: string;
	name: string;
	description: string;
	status: TWorkflowStatus;
	nodes_count: number;
	last_execution_at: string | null;
	created_at: string;
};

// ─── Request DTOs ────────────────────────────────────────────

// POST /workspaces/{id}/workflows
export type TCreateWorkflowDto = {
	name: string;
	description?: string;
	nodes?: unknown[];
	edges?: unknown[];
};

// PUT /workspaces/{id}/workflows/{id}
export type TUpdateWorkflowDto = Partial<TCreateWorkflowDto>;
