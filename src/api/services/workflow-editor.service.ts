import axiosClient from '../http/axios.config';
import { WorkflowEndpoints, WorkflowEditorEndpoints } from '../http/endpoints';
import type { TApiResponse, TPaginatedResponse } from '@/types/api.type';
import type {
	IWorkflow,
	IWorkflowFilters,
	TCreateWorkflowDto,
	TUpdateWorkflowDto,
	IWorkflowExecutionResult,
	IWorkflowVersion,
	IWorkflowExport,
	IWorkflowImport,
	IWorkflowValidationResult,
	ITestNodeDto,
	ITestNodeResult,
	ICloneWorkflowDto,
	IDuplicateWorkflowDto,
	IWorkflowNode,
	IWorkflowConnection,
	IWorkflowVersionComparison,
	IWorkflowPinnedData,
	ISetPinnedDataDto,
} from '@/types/workflow.type';

/**
 * WorkflowEditorService
 *
 * Service layer for the Workflow Editor's API calls.
 * Covers: single-workflow CRUD (editor-specific signatures),
 * execution, activate/deactivate, duplicate, clone, import/export,
 * validate, test-node, versions, and pinned data.
 */
export const WorkflowEditorService = {
	// ── Core CRUD (editor call signatures) ───────────────
	list: async (workspaceId: string, filters?: IWorkflowFilters): Promise<IWorkflow[]> => {
		const { data } = await axiosClient.get<TPaginatedResponse<IWorkflow>>(
			WorkflowEndpoints.LIST(workspaceId),
			{ params: filters },
		);
		return data.data;
	},

	detail: async (workspaceId: string, id: string): Promise<IWorkflow> => {
		const { data } = await axiosClient.get<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.DETAIL(workspaceId, id),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: TCreateWorkflowDto): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, id: string, payload: TUpdateWorkflowDto): Promise<IWorkflow> => {
		const { data } = await axiosClient.put<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.UPDATE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		await axiosClient.delete(WorkflowEndpoints.DELETE(workspaceId, id));
	},

	// ── Execute / Activate / Deactivate ──────────────────
	execute: async (
		workspaceId: string,
		id: string,
		payload?: { input_data?: Record<string, unknown>; test_mode?: boolean },
	): Promise<IWorkflowExecutionResult> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflowExecutionResult>>(
			WorkflowEndpoints.EXECUTE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	activate: async (workspaceId: string, id: string): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.ACTIVATE(workspaceId, id),
		);
		return data.data;
	},

	deactivate: async (workspaceId: string, id: string): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.DEACTIVATE(workspaceId, id),
		);
		return data.data;
	},

	// ── Duplicate / Clone ────────────────────────────────
	duplicate: async (workspaceId: string, id: string, payload?: IDuplicateWorkflowDto): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.DUPLICATE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	clone: async (workspaceId: string, id: string, payload: ICloneWorkflowDto): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEditorEndpoints.CLONE(workspaceId, id),
			payload,
		);
		return data.data;
	},

	// ── Import / Export ──────────────────────────────────
	exportWorkflow: async (workspaceId: string, id: string): Promise<IWorkflowExport> => {
		const { data } = await axiosClient.get<TApiResponse<IWorkflowExport>>(
			WorkflowEndpoints.EXPORT(workspaceId, id),
		);
		return data.data;
	},

	importWorkflow: async (workspaceId: string, payload: IWorkflowImport): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.IMPORT(workspaceId),
			payload,
		);
		return data.data;
	},

	// ── Validate / Test Node ─────────────────────────────
	validate: async (
		workspaceId: string,
		nodes: IWorkflowNode[],
		connections: IWorkflowConnection[],
	): Promise<IWorkflowValidationResult> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflowValidationResult>>(
			WorkflowEditorEndpoints.VALIDATE(workspaceId),
			{ nodes, connections },
		);
		return data.data;
	},

	testNode: async (workspaceId: string, payload: ITestNodeDto): Promise<ITestNodeResult> => {
		const { data } = await axiosClient.post<TApiResponse<ITestNodeResult>>(
			WorkflowEditorEndpoints.TEST_NODE(workspaceId),
			payload,
		);
		return data.data;
	},

	// ── Versions ─────────────────────────────────────────
	listVersions: async (workspaceId: string, workflowId: string): Promise<IWorkflowVersion[]> => {
		const { data } = await axiosClient.get<TPaginatedResponse<IWorkflowVersion>>(
			WorkflowEditorEndpoints.VERSIONS(workspaceId, workflowId),
		);
		return data.data;
	},

	rollbackVersion: async (workspaceId: string, id: string, version: number): Promise<IWorkflow> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflow>>(
			WorkflowEditorEndpoints.ROLLBACK(workspaceId, id, version),
		);
		return data.data;
	},

	compareVersions: async (
		workspaceId: string,
		id: string,
		v1: number,
		v2: number,
	): Promise<IWorkflowVersionComparison> => {
		const { data } = await axiosClient.get<TApiResponse<IWorkflowVersionComparison>>(
			WorkflowEditorEndpoints.COMPARE_VERSIONS(workspaceId, id),
			{ params: { v1, v2 } },
		);
		return data.data;
	},

	// ── Pinned Data ──────────────────────────────────────
	listPinnedData: async (workspaceId: string, workflowId: string): Promise<IWorkflowPinnedData[]> => {
		const { data } = await axiosClient.get<TApiResponse<IWorkflowPinnedData[]>>(
			WorkflowEditorEndpoints.PINNED_DATA(workspaceId, workflowId),
		);
		return data.data;
	},

	setPinnedData: async (
		workspaceId: string,
		id: string,
		payload: ISetPinnedDataDto,
	): Promise<IWorkflowPinnedData> => {
		const { data } = await axiosClient.post<TApiResponse<IWorkflowPinnedData>>(
			WorkflowEditorEndpoints.PINNED_DATA(workspaceId, id),
			payload,
		);
		return data.data;
	},

	deletePinnedData: async (workspaceId: string, id: string, nodeId: string): Promise<void> => {
		await axiosClient.delete(WorkflowEditorEndpoints.PINNED_DATA_NODE(workspaceId, id, nodeId));
	},

	// ── Toggle Favorite ──────────────────────────────────
	toggleFavorite: async (workspaceId: string, id: string, is_favorite: boolean): Promise<IWorkflow> => {
		const { data } = await axiosClient.put<TApiResponse<IWorkflow>>(
			WorkflowEndpoints.UPDATE(workspaceId, id),
			{ is_favorite },
		);
		return data.data;
	},
};
