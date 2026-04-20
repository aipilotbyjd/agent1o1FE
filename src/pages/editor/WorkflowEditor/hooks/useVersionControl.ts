import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'react-toastify';
import { IWorkflowVersion } from '@/types/workflow.type';
import { useWorkflowVersions, useRollbackWorkflowVersion } from '@/api/hooks/useWorkflowEditor';
import {
	workflowNodesToEditorNodes,
	workflowConnectionsToEditorEdges,
} from '../_helper/serializer.helper';

export const useVersionControl = (
	workspaceId: string | undefined,
	workflowId: string | null | undefined,
	workflow: any, // current workflow data
	setNodes: (updater: (nodes: Node[]) => Node[]) => void,
	setEdges: (edges: Edge[]) => void,
	setWorkflowName: (name: string) => void,
	setHasChanges: (hasChanges: boolean) => void,
	saveToHistory: () => void,
	refetchWorkflow: () => Promise<any>,
	handleAddNodeAfterRef: React.MutableRefObject<(nodeId: string) => void>,
	handleContextMenuRef: React.MutableRefObject<(nodeId: string, x: number, y: number) => void>,
) => {
	const { data: versionHistoryData } = useWorkflowVersions(
		workspaceId || null,
		workflowId || null,
		{
			enabled: !!workflowId,
		},
	);
	const rollbackWorkflowVersion = useRollbackWorkflowVersion();

	const versionHistory = versionHistoryData || [];
	const versionEntries = versionHistory.map((version: IWorkflowVersion) => ({
		id: String(version.version),
		timestamp: new Date(version.created_at * 1000),
		description: version.change_message || `Version ${version.version}`,
		author: version.created_by,
		nodeCount: version.nodes?.length || 0,
		isCurrent: workflow?.version === version.version,
	}));

	const buildEditorNodes = useCallback(
		(workflowNodes: any[] = []) =>
			workflowNodesToEditorNodes(workflowNodes).map((node) => ({
				...node,
				data: {
					...node.data,
					onAddNode: (nodeId: string) => handleAddNodeAfterRef.current(nodeId),
					onContextMenu: (nodeId: string, x: number, y: number) =>
						handleContextMenuRef.current(nodeId, x, y),
				},
			})),
		[handleAddNodeAfterRef, handleContextMenuRef],
	);

	const applyVersionToCanvas = useCallback(
		(versionNodes: any[] = [], versionConnections: any[] = []) => {
			if (versionNodes.length > 0) {
				const loadedNodes = buildEditorNodes(versionNodes);
				setNodes((currentNodes) => {
					const noteNodes = currentNodes.filter((n) => n.id.startsWith('note_'));
					return [...loadedNodes, ...noteNodes] as Node[];
				});
			} else {
				setNodes((currentNodes) => {
					const noteNodes = currentNodes.filter((n) => n.id.startsWith('note_'));
					const starterNode: Node = {
						id: 'starter',
						type: 'addNode',
						position: { x: 0, y: 0 },
						data: {
							label: 'Click to add',
							type: 'addNode',
							parameters: {},
							// Callbacks will be attached via ref or generic logic if possible,
							// but here we might need to rely on the fact that they are static or handled elsewhere
							// Actually, starter node needs onClick which is specific to UI logic (open palette)
							// We can handle this by passing a callback or checking type in UI
						},
					};
					return [starterNode, ...noteNodes];
				});
			}

			setEdges(
				versionConnections.length > 0
					? (workflowConnectionsToEditorEdges(versionConnections) as Edge[])
					: [],
			);
			setTimeout(saveToHistory, 0);
		},
		[buildEditorNodes, saveToHistory, setEdges, setNodes],
	);

	const handleRestoreVersion = useCallback(
		async (versionId: string) => {
			if (!workspaceId || !workflowId) return;
			const versionNumber = Number(versionId);
			if (!Number.isFinite(versionNumber)) {
				toast.error('Invalid version');
				return;
			}

			try {
				const restoredWorkflow = await rollbackWorkflowVersion.mutateAsync({
					workspaceId,
					id: workflowId,
					version: versionNumber,
				});

				if (restoredWorkflow.nodes && restoredWorkflow.connections) {
					applyVersionToCanvas(restoredWorkflow.nodes, restoredWorkflow.connections);
					if (restoredWorkflow.name) {
						setWorkflowName(restoredWorkflow.name);
					}
					setHasChanges(false);
				} else {
					await refetchWorkflow();
				}

				toast.success(`Restored to version ${versionNumber}`);
			} catch {
				// Error toast is handled by the hook
			}
		},
		[
			applyVersionToCanvas,
			refetchWorkflow,
			rollbackWorkflowVersion,
			workflowId,
			workspaceId,
			setWorkflowName,
			setHasChanges,
		],
	);

	const handlePreviewVersion = useCallback(
		(versionId: string) => {
			const versionNumber = Number(versionId);
			if (!Number.isFinite(versionNumber)) {
				toast.error('Invalid version');
				return;
			}

			const targetVersion = versionHistory.find(
				(version: IWorkflowVersion) => version.version === versionNumber,
			);
			if (!targetVersion) {
				toast.error('Version not found');
				return;
			}

			applyVersionToCanvas(targetVersion.nodes || [], targetVersion.connections || []);
			setHasChanges(true);
			toast.info(`Previewing version ${targetVersion.version}`);
		},
		[applyVersionToCanvas, versionHistory, setHasChanges],
	);

	return {
		versionEntries,
		handleRestoreVersion,
		handlePreviewVersion,
	};
};
