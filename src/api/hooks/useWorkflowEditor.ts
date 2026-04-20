import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { WorkflowEditorService } from '../services/workflow-editor.service';
import { queryKeys } from '../utils/query.helper';
import type {
	IWorkflowFilters,
	TCreateWorkflowDto,
	TUpdateWorkflowDto,
	IDuplicateWorkflowDto,
	ICloneWorkflowDto,
	IWorkflowImport,
	IWorkflowNode,
	IWorkflowConnection,
	ITestNodeDto,
	ISetPinnedDataDto,
} from '@/types/workflow.type';

// ── Core read hooks ────────────────────────────────────

export const useWorkflows = (
	workspaceId: string | null,
	filters?: IWorkflowFilters,
	options: { enabled?: boolean } = {},
) => {
	const { enabled = true } = options;
	return useQuery({
		queryKey: queryKeys.workflows.list(workspaceId || '', filters as Record<string, unknown>),
		queryFn: () => WorkflowEditorService.list(workspaceId!, filters),
		enabled: enabled && !!workspaceId,
	});
};

export const useWorkflow = (workspaceId: string | null, id: string | null) =>
	useQuery({
		queryKey: queryKeys.workflows.detail(workspaceId || '', id || ''),
		queryFn: () => WorkflowEditorService.detail(workspaceId!, id!),
		enabled: !!workspaceId && !!id,
	});

// ── Mutation hooks ──────────────────────────────────────

export const useCreateWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, payload }: { workspaceId: string; payload: TCreateWorkflowDto }) =>
			WorkflowEditorService.create(workspaceId, payload),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			toast.success(`Workflow "${data.name}" created!`);
		},
		onError: () => toast.error('Failed to create workflow'),
	});
};

export const useUpdateWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			payload,
		}: {
			workspaceId: string;
			id: string;
			payload: TUpdateWorkflowDto;
		}) => WorkflowEditorService.update(workspaceId, id, payload),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			qc.setQueryData(queryKeys.workflows.detail(variables.workspaceId, data.id), data);
		},
		onError: () => toast.error('Failed to update workflow'),
	});
};

export const useDeleteWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, id }: { workspaceId: string; id: string }) =>
			WorkflowEditorService.delete(workspaceId, id),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			toast.success('Workflow deleted!');
		},
		onError: () => toast.error('Failed to delete workflow'),
	});
};

export const useExecuteWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			payload,
		}: {
			workspaceId: string;
			id: string;
			payload?: { input_data?: Record<string, unknown>; test_mode?: boolean };
		}) => WorkflowEditorService.execute(workspaceId, id, payload),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.detail(variables.workspaceId, variables.id) });
			toast.success(`Execution started (ID: ${data.execution_id})`);
		},
		onError: () => toast.error('Failed to execute workflow'),
	});
};

export const useActivateWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, id }: { workspaceId: string; id: string }) =>
			WorkflowEditorService.activate(workspaceId, id),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			qc.setQueryData(queryKeys.workflows.detail(variables.workspaceId, data.id), data);
			toast.success(`Workflow "${data.name}" activated!`);
		},
		onError: () => toast.error('Failed to activate workflow'),
	});
};

export const useDeactivateWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, id }: { workspaceId: string; id: string }) =>
			WorkflowEditorService.deactivate(workspaceId, id),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			qc.setQueryData(queryKeys.workflows.detail(variables.workspaceId, data.id), data);
			toast.success(`Workflow "${data.name}" deactivated!`);
		},
		onError: () => toast.error('Failed to deactivate workflow'),
	});
};

export const useDuplicateWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			payload,
		}: {
			workspaceId: string;
			id: string;
			payload?: IDuplicateWorkflowDto;
		}) => WorkflowEditorService.duplicate(workspaceId, id, payload),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			toast.success(`Workflow duplicated as "${data.name}"!`);
		},
		onError: () => toast.error('Failed to duplicate workflow'),
	});
};

export const useToggleFavorite = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			is_favorite,
		}: {
			workspaceId: string;
			id: string;
			is_favorite: boolean;
		}) => WorkflowEditorService.toggleFavorite(workspaceId, id, is_favorite),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			qc.setQueryData(queryKeys.workflows.detail(variables.workspaceId, data.id), data);
		},
		onError: () => toast.error('Failed to update favorite status'),
	});
};

export const useCloneWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, id, payload }: { workspaceId: string; id: string; payload: ICloneWorkflowDto }) =>
			WorkflowEditorService.clone(workspaceId, id, payload),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			toast.success(`Workflow cloned as "${data.name}"!`);
		},
		onError: () => toast.error('Failed to clone workflow'),
	});
};

export const useExportWorkflow = () =>
	useMutation({
		mutationFn: ({ workspaceId, id }: { workspaceId: string; id: string }) =>
			WorkflowEditorService.exportWorkflow(workspaceId, id),
		onSuccess: (data) => {
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${data.workflow.name.replace(/\s+/g, '_')}_export.json`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success('Workflow exported successfully');
		},
		onError: () => toast.error('Failed to export workflow'),
	});

export const useImportWorkflow = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, payload }: { workspaceId: string; payload: IWorkflowImport }) =>
			WorkflowEditorService.importWorkflow(workspaceId, payload),
		onSuccess: (data, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			toast.success(`Workflow "${data.name}" imported!`);
		},
		onError: () => toast.error('Failed to import workflow'),
	});
};

export const useValidateWorkflow = () =>
	useMutation({
		mutationFn: ({
			workspaceId,
			nodes,
			connections,
		}: {
			workspaceId: string;
			nodes: IWorkflowNode[];
			connections: IWorkflowConnection[];
		}) => WorkflowEditorService.validate(workspaceId, nodes, connections),
		onError: () => toast.error('Failed to validate workflow'),
	});

export const useTestNode = () =>
	useMutation({
		mutationFn: ({ workspaceId, payload }: { workspaceId: string; payload: ITestNodeDto }) =>
			WorkflowEditorService.testNode(workspaceId, payload),
		onError: () => toast.error('Failed to test node'),
	});

// ── Version hooks ──────────────────────────────────────

export const useWorkflowVersions = (
	workspaceId: string | null,
	workflowId: string | null,
	options: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: queryKeys.workflows.versions(workspaceId || '', workflowId || ''),
		queryFn: () => WorkflowEditorService.listVersions(workspaceId!, workflowId!),
		enabled: options.enabled !== false && !!workspaceId && !!workflowId,
	});

export const useRollbackWorkflowVersion = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			version,
		}: {
			workspaceId: string;
			id: string;
			version: number;
		}) => WorkflowEditorService.rollbackVersion(workspaceId, id, version),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.workflows.all(variables.workspaceId) });
			qc.invalidateQueries({
				queryKey: queryKeys.workflows.detail(variables.workspaceId, variables.id),
			});
			toast.success(`Workflow rolled back to version ${variables.version}`);
		},
		onError: () => toast.error('Failed to rollback workflow version'),
	});
};

export const useCompareWorkflowVersions = (
	workspaceId: string | null,
	workflowId: string | null,
	v1: number | null,
	v2: number | null,
	options: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: queryKeys.workflows.compareVersions(
			workspaceId || '',
			workflowId || '',
			v1 || 0,
			v2 || 0,
		),
		queryFn: () => WorkflowEditorService.compareVersions(workspaceId!, workflowId!, v1!, v2!),
		enabled: options.enabled !== false && !!workspaceId && !!workflowId && v1 !== null && v2 !== null,
	});

// ── Pinned data hooks ──────────────────────────────────

export const usePinnedData = (
	workspaceId: string | null,
	workflowId: string | null,
	options: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: queryKeys.workflows.pinnedData(workspaceId || '', workflowId || ''),
		queryFn: () => WorkflowEditorService.listPinnedData(workspaceId!, workflowId!),
		enabled: options.enabled !== false && !!workspaceId && !!workflowId,
	});

export const useSetPinnedData = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			payload,
		}: {
			workspaceId: string;
			id: string;
			payload: ISetPinnedDataDto;
		}) => WorkflowEditorService.setPinnedData(workspaceId, id, payload),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({
				queryKey: queryKeys.workflows.pinnedData(variables.workspaceId, variables.id),
			});
			toast.success('Pinned data saved');
		},
		onError: () => toast.error('Failed to save pinned data'),
	});
};

export const useDeletePinnedData = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			id,
			nodeId,
		}: {
			workspaceId: string;
			id: string;
			nodeId: string;
		}) => WorkflowEditorService.deletePinnedData(workspaceId, id, nodeId),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({
				queryKey: queryKeys.workflows.pinnedData(variables.workspaceId, variables.id),
			});
			toast.success('Pinned data deleted');
		},
		onError: () => toast.error('Failed to delete pinned data'),
	});
};
