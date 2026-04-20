import { useCallback, useState, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { INodeTypeDefinition } from '../_helper/nodeTypes.helper';
import { generateNodeId, IEditorNodeData } from '../_helper/serializer.helper';
import { applyTreeLayout } from '../_helper/treeLayout.helper';
import { toast } from 'react-toastify';

export const useCanvasInteraction = (
	nodes: Node[],
	edges: Edge[],
	setNodes: (updater: (nodes: Node[]) => Node[]) => void,
	setEdges: (updater: (edges: Edge[]) => Edge[]) => void,
	saveToHistory: () => void,
	canvasRef: any,
) => {
	const [isNodePaletteOpen, setIsNodePaletteOpen] = useState(false);
	const [addAfterNodeId, setAddAfterNodeId] = useState<string | null>(null);
	const [insertOnEdgeId, setInsertOnEdgeId] = useState<string | null>(null);
	const [insertOnEdgePosition, setInsertOnEdgePosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [canvasContextMenu, setCanvasContextMenu] = useState<{
		x: number;
		y: number;
		canvasPosition: { x: number; y: number };
	} | null>(null);
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(
		null,
	);

	// Recent nodes state
	const [recentNodes, setRecentNodes] = useState<string[]>(() => {
		try {
			return JSON.parse(localStorage.getItem('linkflow_recent_nodes') || '[]');
		} catch {
			return [];
		}
	});

	const trackRecentNode = useCallback((nodeType: string) => {
		setRecentNodes((prev) => {
			const updated = [nodeType, ...prev.filter((t) => t !== nodeType)].slice(0, 5);
			localStorage.setItem('linkflow_recent_nodes', JSON.stringify(updated));
			return updated;
		});
	}, []);

	// Refs for callbacks to be accessed inside nodes without re-rendering nodes
	const handleAddNodeAfterRef = useRef<(nodeId: string) => void>(() => {});
	const handleContextMenuRef = useRef<(nodeId: string, x: number, y: number) => void>(() => {});

	// Callbacks to be updated
	const handleAddNodeAfter = useCallback((nodeId: string) => {
		setAddAfterNodeId(nodeId);
		setIsNodePaletteOpen(true);
	}, []);

	const handleContextMenu = useCallback((nodeId: string, x: number, y: number) => {
		setContextMenu({ nodeId, x, y });
	}, []);

	// Update refs
	handleAddNodeAfterRef.current = handleAddNodeAfter;
	handleContextMenuRef.current = handleContextMenu;

	// Auto arrange
	const autoArrangeNodes = useCallback((nodesToArrange: Node[], edgesToUse: Edge[]) => {
		return applyTreeLayout(nodesToArrange, edgesToUse, {
			horizontalSpacing: 250,
			verticalSpacing: 140,
			direction: 'LR',
		});
	}, []);

	const handleAutoArrange = useCallback(() => {
		const arrangedNodes = autoArrangeNodes(nodes, edges);
		setNodes(() => arrangedNodes);
		toast.success('Nodes auto-arranged');
		setTimeout(() => canvasRef.current?.fitView(), 50);
		setTimeout(saveToHistory, 0);
	}, [nodes, edges, setNodes, autoArrangeNodes, saveToHistory, canvasRef]);

	const handleNodeSelect = useCallback(
		(nodeType: INodeTypeDefinition) => {
			trackRecentNode(nodeType.type);

			const hasStarterNode = nodes.some((n) => n.id === 'starter');
			const position = { x: 0, y: 0 };
			const newNodeId = generateNodeId();

			const newNode: Node<IEditorNodeData> = {
				id: newNodeId,
				type: nodeType.type,
				position,
				data: {
					label: nodeType.label,
					type: nodeType.type,
					apiType: nodeType.apiType,
					parameters: nodeType.parameters.reduce(
						(acc, param) => {
							if (param.default !== undefined) acc[param.name] = param.default;
							return acc;
						},
						{} as Record<string, unknown>,
					),
					onAddNode: (nodeId: string) => handleAddNodeAfterRef.current(nodeId),
					onContextMenu: (nodeId: string, x: number, y: number) =>
						handleContextMenuRef.current(nodeId, x, y),
				},
			};

			let updatedNodes: Node[];
			let updatedEdges: Edge[];

			if (hasStarterNode) {
				updatedNodes = [newNode];
				updatedEdges = [];
			} else {
				updatedNodes = [...nodes, newNode];
				updatedEdges = [...edges];
			}

			if (addAfterNodeId) {
				// Logic to label edge based on source node type (if/switch)
				const sourceNode = updatedNodes.find((n) => n.id === addAfterNodeId);
				const sourceNodeData = sourceNode?.data as IEditorNodeData | undefined;
				let edgeLabel: string | undefined;

				if (sourceNodeData?.type === 'if') {
					const existingEdgesFromSource = updatedEdges.filter(
						(e) => e.source === addAfterNodeId,
					);
					edgeLabel = existingEdgesFromSource.length === 0 ? 'true' : 'false';
				} else if (sourceNodeData?.type === 'switch') {
					const existingEdgesFromSource = updatedEdges.filter(
						(e) => e.source === addAfterNodeId,
					);
					edgeLabel = `case ${existingEdgesFromSource.length + 1}`;
				}

				const newEdge = {
					id: `edge-${addAfterNodeId}-${newNodeId}`,
					source: addAfterNodeId,
					target: newNodeId,
					type: 'custom',
					data: edgeLabel ? { label: edgeLabel } : undefined,
				};
				updatedEdges = [...updatedEdges, newEdge];
				setAddAfterNodeId(null);
			}

			const arrangedNodes = autoArrangeNodes(updatedNodes, updatedEdges);
			setNodes(() => arrangedNodes);
			setEdges(() => updatedEdges);

			setTimeout(() => canvasRef.current?.fitView(), 50);
			setTimeout(saveToHistory, 0);
		},
		[
			nodes,
			edges,
			setNodes,
			setEdges,
			saveToHistory,
			addAfterNodeId,
			autoArrangeNodes,
			trackRecentNode,
			canvasRef,
		],
	);

	const handleNodeSelectForEdgeInsert = useCallback(
		(nodeType: INodeTypeDefinition) => {
			if (!insertOnEdgeId || !insertOnEdgePosition) return false;

			const edge = edges.find((e) => e.id === insertOnEdgeId);
			if (!edge) {
				setInsertOnEdgeId(null);
				setInsertOnEdgePosition(null);
				return false;
			}

			trackRecentNode(nodeType.type);
			const newNodeId = generateNodeId();

			const newNode: Node<IEditorNodeData> = {
				id: newNodeId,
				type: nodeType.type,
				position: insertOnEdgePosition,
				data: {
					label: nodeType.label,
					type: nodeType.type,
					apiType: nodeType.apiType,
					parameters: nodeType.parameters.reduce(
						(acc, param) => {
							if (param.default !== undefined) acc[param.name] = param.default;
							return acc;
						},
						{} as Record<string, unknown>,
					),
					onAddNode: (nodeId: string) => handleAddNodeAfterRef.current(nodeId),
					onContextMenu: (nodeId: string, x: number, y: number) =>
						handleContextMenuRef.current(nodeId, x, y),
				},
			};

			const newEdge1: Edge = {
				id: `edge-${edge.source}-${newNodeId}`,
				source: edge.source,
				target: newNodeId,
				type: 'custom',
			};

			const newEdge2: Edge = {
				id: `edge-${newNodeId}-${edge.target}`,
				source: newNodeId,
				target: edge.target,
				type: 'custom',
				data: edge.data,
			};

			setNodes((nds) => [...nds, newNode]);
			setEdges((eds) => [...eds.filter((e) => e.id !== insertOnEdgeId), newEdge1, newEdge2]);

			setInsertOnEdgeId(null);
			setInsertOnEdgePosition(null);
			setTimeout(saveToHistory, 0);
			return true;
		},
		[
			insertOnEdgeId,
			insertOnEdgePosition,
			edges,
			setNodes,
			setEdges,
			saveToHistory,
			trackRecentNode,
		],
	);

	const handleInsertNodeOnEdge = useCallback(
		(edgeId: string, position: { x: number; y: number }) => {
			setInsertOnEdgeId(edgeId);
			setInsertOnEdgePosition(position);
			setIsNodePaletteOpen(true);
		},
		[],
	);

	// Select all nodes
	const handleSelectAll = useCallback(() => {
		setNodes((nds) => nds.map((n) => ({ ...n, selected: n.type !== 'addNode' })));
	}, [setNodes]);

	// Add group
	const handleAddGroup = useCallback(() => {
		const selectedNodesList = nodes.filter((n) => n.selected && n.type !== 'addNode');

		// Calculate bounding box of selected nodes or use default position
		let position = { x: 100, y: 100 };
		let width = 400;
		let height = 300;

		if (selectedNodesList.length > 0) {
			const minX = Math.min(...selectedNodesList.map((n) => n.position.x)) - 50;
			const minY = Math.min(...selectedNodesList.map((n) => n.position.y)) - 50;
			const maxX = Math.max(...selectedNodesList.map((n) => n.position.x)) + 150;
			const maxY = Math.max(...selectedNodesList.map((n) => n.position.y)) + 150;
			position = { x: minX, y: minY };
			width = Math.max(400, maxX - minX);
			height = Math.max(300, maxY - minY);
		}

		const newGroup: Node = {
			id: generateNodeId(),
			type: 'group',
			position,
			style: { width, height },
			data: {
				label: 'New Group',
				color: 'gray',
			},
		};

		// Add group behind other nodes
		setNodes((nds) => [newGroup, ...nds]);
		toast.success('Group added');
		setTimeout(saveToHistory, 0);
	}, [nodes, setNodes, saveToHistory]);

	// Handle adding node from context menu
	const handleAddNodeFromContextMenu = useCallback(
		(nodeType: INodeTypeDefinition, position: { x: number; y: number }) => {
			trackRecentNode(nodeType.type);
			const newNodeId = generateNodeId();

			const newNode: Node<IEditorNodeData> = {
				id: newNodeId,
				type: nodeType.type,
				position,
				data: {
					label: nodeType.label,
					type: nodeType.type,
					apiType: nodeType.apiType,
					parameters: nodeType.parameters.reduce(
						(acc, param) => {
							if (param.default !== undefined) acc[param.name] = param.default;
							return acc;
						},
						{} as Record<string, unknown>,
					),
					onAddNode: (nodeId: string) => handleAddNodeAfterRef.current(nodeId),
					onContextMenu: (nodeId: string, x: number, y: number) =>
						handleContextMenuRef.current(nodeId, x, y),
				},
			};

			setNodes((nds) => [...nds, newNode]);
			setCanvasContextMenu(null);
			setTimeout(saveToHistory, 0);
		},
		[setNodes, saveToHistory, trackRecentNode],
	);

	// Handle toggle node disabled
	const handleToggleNodeDisabled = useCallback(
		(nodeId: string) => {
			setNodes((nds) =>
				nds.map((n) => {
					if (n.id === nodeId) {
						return {
							...n,
							data: {
								...n.data,
								isDisabled: !n.data.isDisabled,
							},
							opacity: !n.data.isDisabled ? 0.5 : 1, // Visual feedback
						};
					}
					return n;
				}),
			);
			setContextMenu(null);
			setTimeout(saveToHistory, 0);
		},
		[setNodes, saveToHistory],
	);

	return {
		isNodePaletteOpen,
		setIsNodePaletteOpen,
		addAfterNodeId,
		setAddAfterNodeId,
		insertOnEdgeId,
		setInsertOnEdgeId,
		insertOnEdgePosition,
		setInsertOnEdgePosition,
		canvasContextMenu,
		setCanvasContextMenu,
		contextMenu,
		setContextMenu,

		recentNodes,
		handleNodeSelect,
		handleNodeSelectForEdgeInsert,
		handleInsertNodeOnEdge,
		handleAutoArrange,
		handleAddNodeAfterRef,
		handleContextMenuRef,
		handleSelectAll,
		handleAddGroup,
		handleAddNodeFromContextMenu,
		handleToggleNodeDisabled,
	};
};
