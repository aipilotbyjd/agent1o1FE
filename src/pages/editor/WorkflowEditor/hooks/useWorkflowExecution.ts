import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
	useExecuteWorkflow,
	useTestNode,
	useDeactivateWorkflow,
	useActivateWorkflow,
} from '@/api/hooks/useWorkflowEditor';
import useWebSocket from '@/hooks/useWebSocket';
import { getWebSocketUrl } from '@/utils/expressionEngine.util';
import { IExecutionLogEntry } from '../_partial/ExecutionPanel.partial';
import { IEditorNodeData } from '../_helper/serializer.helper';
import { Node } from '@xyflow/react';

export const useWorkflowExecution = (
	workspaceId: string | undefined,
	workflowId: string | null | undefined,
	setNodes: (updater: (nodes: Node[]) => Node[]) => void, // React Flow setter style
) => {
	const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
	const [executionLogs, setExecutionLogs] = useState<IExecutionLogEntry[]>([]);
	const currentExecutionIdRef = useRef<string | null>(null);

	const executeWorkflow = useExecuteWorkflow();
	const testNodeMutation = useTestNode();
	const activateWorkflow = useActivateWorkflow();
	const deactivateWorkflow = useDeactivateWorkflow();

	// WebSocket connection
	const wsUrl = workspaceId
		? `${getWebSocketUrl()}?workspace_id=${workspaceId}`
		: getWebSocketUrl();

	const handleWebSocketMessage = useCallback(
		(message: any) => {
			const { type, data } = message as { type: string; data: any };

			switch (type) {
				case 'execution.started':
					currentExecutionIdRef.current = data.execution_id;
					break;

				case 'execution.node.started': {
					const { node_id, execution_id } = data;
					if (execution_id !== currentExecutionIdRef.current) return;

					setNodes((nds) => {
						const node = nds.find((n) => n.id === node_id);
						// Optimization: Don't update if already running
						if (node && (node.data as any).executionStatus === 'running') return nds;

						return nds.map((n) =>
							n.id === node_id
								? { ...n, data: { ...n.data, executionStatus: 'running' } }
								: n,
						);
					});

					setExecutionLogs((prev) => {
						// Avoid duplicates
						if (
							prev.some((log) => log.nodeId === node_id && log.status === 'running')
						) {
							return prev;
						}
						return [
							...prev,
							{
								nodeId: node_id,
								nodeName: 'Node',
								nodeType: '',
								status: 'running',
								startTime: new Date(),
								inputData: data.input_data,
							},
						];
					});
					break;
				}

				case 'execution.node.completed': {
					const { node_id, execution_id, output_data } = data;
					if (execution_id !== currentExecutionIdRef.current) return;

					setNodes((nds) => {
						const node = nds.find((n) => n.id === node_id);
						if (node && (node.data as any).executionStatus === 'success') return nds;

						return nds.map((n) =>
							n.id === node_id
								? { ...n, data: { ...n.data, executionStatus: 'success' } }
								: n,
						);
					});

					setExecutionLogs((prev) =>
						prev.map((log) =>
							log.nodeId === node_id && log.status === 'running'
								? {
										...log,
										status: 'success',
										endTime: new Date(),
										outputData: output_data,
										itemsCount: output_data?.items?.length || 1,
									}
								: log,
						),
					);
					break;
				}

				case 'execution.node.failed': {
					const { node_id, execution_id, error } = data;
					if (execution_id !== currentExecutionIdRef.current) return;

					setNodes((nds) => {
						const node = nds.find((n) => n.id === node_id);
						if (node && (node.data as any).executionStatus === 'error') return nds;

						return nds.map((n) =>
							n.id === node_id
								? { ...n, data: { ...n.data, executionStatus: 'error' } }
								: n,
						);
					});

					setExecutionLogs((prev) =>
						prev.map((log) =>
							log.nodeId === node_id && log.status === 'running'
								? {
										...log,
										status: 'error',
										endTime: new Date(),
										error: error || 'Node execution failed',
									}
								: log,
						),
					);
					break;
				}

				case 'execution.completed':
					currentExecutionIdRef.current = null;
					toast.success('Workflow executed successfully');
					break;

				case 'execution.failed':
					currentExecutionIdRef.current = null;
					toast.error(data.error || 'Workflow execution failed');
					break;
			}
		},
		[setNodes, setExecutionLogs],
	);

	useWebSocket(wsUrl, {
		onMessage: handleWebSocketMessage,
	});

	const handleRun = useCallback(async () => {
		if (!workspaceId || !workflowId) {
			toast.error('Please save the workflow first');
			return;
		}

		setIsExecutionPanelOpen(true);
		setExecutionLogs([]);

		// Reset node status
		setNodes((nds) =>
			nds.map((n) => ({
				...n,
				data: { ...n.data, executionStatus: undefined },
			})),
		);

		try {
			await executeWorkflow.mutateAsync({
				workspaceId,
				id: workflowId,
				payload: {},
			});
		} catch (error: any) {
			const errorMessage = error?.response?.data?.message || 'Failed to start execution';
			toast.error(errorMessage);
		}
	}, [workspaceId, workflowId, executeWorkflow, setNodes]);

	const handleTestNode = useCallback(
		async (nodeId: string, nodes: Node[]) => {
			if (!workspaceId) return;
			const node = nodes.find((n) => n.id === nodeId);
			if (!node) return;

			const nodeData = node.data as IEditorNodeData;
			const nodeType = nodeData.apiType || nodeData.type;

			try {
				await testNodeMutation.mutateAsync({
					workspaceId,
					payload: {
						node_type: nodeType,
						parameters: (nodeData.parameters as Record<string, unknown>) || {},
					},
				});
				toast.success(`Node "${nodeData.label}" tested successfully`);
			} catch (error: any) {
				const errorMessage = error?.response?.data?.message || 'Test failed';
				toast.error(errorMessage);
			}
		},
		[workspaceId, testNodeMutation],
	);

	const handleToggleSchedule = useCallback(
		async (isScheduleEnabled: boolean) => {
			if (!workspaceId || !workflowId) return isScheduleEnabled;
			try {
				if (isScheduleEnabled) {
					await deactivateWorkflow.mutateAsync({ workspaceId, id: workflowId });
					return false;
				} else {
					await activateWorkflow.mutateAsync({ workspaceId, id: workflowId });
					return true;
				}
			} catch {
				return isScheduleEnabled; // Revert on error
			}
		},
		[workspaceId, workflowId, activateWorkflow, deactivateWorkflow],
	);

	return {
		isExecutionPanelOpen,
		setIsExecutionPanelOpen,
		executionLogs,
		setExecutionLogs,
		handleRun,
		handleTestNode,
		handleToggleSchedule,
		isRunning: executeWorkflow.isPending,
	};
};
