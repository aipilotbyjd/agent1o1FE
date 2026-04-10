/**
 * Workflow Types
 * Matches Laravel backend from docs/frontend/modules/04-workflow-management.md
 */

// Workflow status
export type TWorkflowStatus = 'draft' | 'active' | 'inactive' | 'archived';

// Sort options
export type TWorkflowSortBy =
	| 'name'
	| 'created_at'
	| 'updated_at'
	| 'execution_count'
	| 'last_executed_at';
export type TSortOrder = 'asc' | 'desc';

// Workflow node position
export interface INodePosition {
	x: number;
	y: number;
}

// Workflow node
export interface IWorkflowNode {
	id: string;
	type: string;
	name: string;
	position: INodePosition;
	parameters: Record<string, unknown>;
}

// Workflow connection
export interface IWorkflowConnection {
	id: string;
	source_node_id: string;
	target_node_id: string;
	source_handle?: string;
	target_handle?: string;
}

// Workflow settings
export interface IWorkflowSettings {
	timeout_seconds?: number;
	retry_on_failure?: boolean;
	max_retries?: number;
	error_workflow_id?: string;
}

// Workflow entity
export interface IWorkflow {
	id: string;
	name: string;
	description?: string | null;
	status: TWorkflowStatus;
	version: number;
	tags: string[];
	color?: string | null;
	icon?: string | null;
	category?: string | null;
	is_favorite: boolean;
	folder_id?: string | null;
	execution_count: number;
	last_executed_at: number | null;
	nodes?: IWorkflowNode[];
	connections?: IWorkflowConnection[];
	settings?: IWorkflowSettings;
	created_at: number;
	updated_at: number;
}

// Keep legacy alias for backward compat
export type TWorkflow = IWorkflow;

// Workflow filters for list query
export interface IWorkflowFilters {
	page?: number;
	per_page?: number;
	status?: TWorkflowStatus;
	search?: string;
	tags?: string;
	category?: string;
	is_favorite?: boolean;
	created_after?: number;
	created_before?: number;
	updated_after?: number;
	updated_before?: number;
	sort_by?: TWorkflowSortBy;
	order?: TSortOrder;
}

// ─── Request DTOs ────────────────────────────────────────────

// POST /workspaces/{id}/workflows
export type TCreateWorkflowDto = {
	name: string;
	description?: string;
	nodes?: IWorkflowNode[];
	connections?: IWorkflowConnection[];
	settings?: IWorkflowSettings;
	tags?: string[];
	color?: string;
	icon?: string;
	category?: string;
	folder_id?: string;
};

// PUT /workspaces/{id}/workflows/{id}
export type TUpdateWorkflowDto = {
	name?: string;
	description?: string;
	nodes?: IWorkflowNode[];
	connections?: IWorkflowConnection[];
	settings?: IWorkflowSettings;
	tags?: string[];
	color?: string;
	icon?: string;
	category?: string;
	is_favorite?: boolean;
	folder_id?: string | null;
};

// Execute workflow request
export interface IExecuteWorkflowDto {
	input_data?: Record<string, unknown>;
	test_mode?: boolean;
}

// Workflow execution result (brief)
export interface IWorkflowExecutionResult {
	execution_id: string;
	status: 'running' | 'completed' | 'failed';
	started_at: number;
}

// Duplicate workflow request
export interface IDuplicateWorkflowDto {
	name?: string;
	variables?: Record<string, string>;
}
